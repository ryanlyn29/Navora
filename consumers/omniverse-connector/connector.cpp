#include <grpcpp/grpcpp.h>
#include <pxr/usd/usd/stage.h>
#include <pxr/usd/usdGeom/xform.h>
#include <pxr/usd/usdPhysics/rigidBodyAPI.h>
#include <pxr/usd/usdPhysics/massAPI.h>
#include <pxr/usd/usdPhysics/collisionAPI.h>
#include <pxr/base/gf/vec3d.h>
#include <pxr/base/gf/quatd.h>
#include <iostream>
#include <thread>
#include <atomic>
#include <string>
#include "sim.pb.h"
#include "sim.grpc.pb.h"

PXR_NAMESPACE_USING_DIRECTIVE

class OmniverseConnector {
public:
  OmniverseConnector(const std::string& coordinator_address, const std::string& nucleus_url)
    : coordinator_address_(coordinator_address), nucleus_url_(nucleus_url), running_(false) {
    
    stage_ = pxr::UsdStage::Open(nucleus_url);
    if (!stage_) {
      std::cerr << "Failed to open Nucleus stage: " << nucleus_url << std::endl;
      return;
    }

    auto world = pxr::UsdGeomXform::Define(stage_, pxr::SdfPath("/World"));
    auto entities = pxr::UsdGeomXform::Define(stage_, pxr::SdfPath("/World/Entities"));
    stage_->SetDefaultPrim(world.GetPrim());
  }

  ~OmniverseConnector() {
    stop();
  }

  bool start() {
    if (running_) {
      return false;
    }

    running_ = true;
    sync_thread_ = std::thread(&OmniverseConnector::sync_loop, this);
    return true;
  }

  void stop() {
    if (!running_) {
      return;
    }

    running_ = false;
    if (sync_thread_.joinable()) {
      sync_thread_.join();
    }
  }

private:
  void sync_loop() {
    auto channel = grpc::CreateChannel(coordinator_address_, grpc::InsecureChannelCredentials());
    auto stub = navora::sim::SimulationCoordinator::NewStub(channel);

    navora::sim::StreamRequest request;
    request.set_consumer_id("omniverse_connector");
    request.set_start_tick(0);

    grpc::ClientContext context;
    auto reader = stub->StreamState(&context, request);

    navora::sim::StateDelta delta;
    while (running_ && reader->Read(&delta)) {
      update_stage(delta);
      stage_->Save();
    }

    reader->Finish();
  }

  void update_stage(const navora::sim::StateDelta& delta) {
    for (const auto& entity : delta.updated()) {
      std::string path_str = "/World/Entities/" + entity.id();
      pxr::SdfPath path(path_str);

      auto prim = stage_->GetPrimAtPath(path);
      if (!prim.IsValid()) {
        auto xform = pxr::UsdGeomXform::Define(stage_, path);
        prim = xform.GetPrim();
      }

      auto xform = pxr::UsdGeomXform(prim);
      pxr::GfVec3d translation(
        entity.transform().position().x(),
        entity.transform().position().y(),
        entity.transform().position().z()
      );
      pxr::GfQuatd rotation(
        entity.transform().rotation().w(),
        entity.transform().rotation().x(),
        entity.transform().rotation().y(),
        entity.transform().rotation().z()
      );

      auto xform_api = pxr::UsdGeomXformCommonAPI(xform);
      xform_api.SetTranslate(translation);
      xform_api.SetRotate(rotation);

      auto rigid_body_api = pxr::UsdPhysicsRigidBodyAPI::Apply(prim);
      if (rigid_body_api) {
        pxr::GfVec3f linear_velocity(
          entity.physics().linear_velocity().x(),
          entity.physics().linear_velocity().y(),
          entity.physics().linear_velocity().z()
        );
        rigid_body_api.GetVelocityAttr().Set(linear_velocity);
      }

      if (entity.has_shape()) {
        if (entity.shape().type() == navora::sim::CollisionShape::SPHERE) {
          auto shape_path = path.AppendChild(pxr::TfToken("Shape"));
          auto sphere = pxr::UsdGeomSphere::Get(stage_, shape_path);
          if (!sphere) {
            sphere = pxr::UsdGeomSphere::Define(stage_, shape_path);
          }
          double radius = entity.shape().size().x();
          sphere.GetRadiusAttr().Set(radius);
        }
      }
    }

    for (const auto& id : delta.removed()) {
      std::string path_str = "/World/Entities/" + id;
      pxr::SdfPath path(path_str);
      stage_->RemovePrim(path);
    }

    for (const auto& entity : delta.created()) {
      std::string path_str = "/World/Entities/" + entity.id();
      pxr::SdfPath path(path_str);

      auto xform = pxr::UsdGeomXform::Define(stage_, path);
      auto prim = xform.GetPrim();

      pxr::GfVec3d translation(
        entity.transform().position().x(),
        entity.transform().position().y(),
        entity.transform().position().z()
      );
      pxr::GfQuatd rotation(
        entity.transform().rotation().w(),
        entity.transform().rotation().x(),
        entity.transform().rotation().y(),
        entity.transform().rotation().z()
      );

      auto xform_api = pxr::UsdGeomXformCommonAPI(xform);
      xform_api.SetTranslate(translation);
      xform_api.SetRotate(rotation);

      auto rigid_body_api = pxr::UsdPhysicsRigidBodyAPI::Apply(prim);
      if (rigid_body_api && entity.has_physics()) {
        pxr::GfVec3f linear_velocity(
          entity.physics().linear_velocity().x(),
          entity.physics().linear_velocity().y(),
          entity.physics().linear_velocity().z()
        );
        rigid_body_api.GetVelocityAttr().Set(linear_velocity);
      }

      if (entity.has_shape()) {
        if (entity.shape().type() == navora::sim::CollisionShape::SPHERE) {
          auto shape_path = path.AppendChild(pxr::TfToken("Shape"));
          auto sphere = pxr::UsdGeomSphere::Define(stage_, shape_path);
          double radius = entity.shape().size().x();
          sphere.GetRadiusAttr().Set(radius);
        }
      }
    }
  }

  std::string coordinator_address_;
  std::string nucleus_url_;
  pxr::UsdStageRefPtr stage_;
  std::atomic<bool> running_;
  std::thread sync_thread_;
};

int main(int argc, char** argv) {
  std::string coordinator = "localhost:50051";
  std::string nucleus = "omniverse://localhost/Users/navora/navora_live.usd";

  if (argc > 1) {
    coordinator = argv[1];
  }
  if (argc > 2) {
    nucleus = argv[2];
  }

  std::cout << "Omniverse Connector" << std::endl;
  std::cout << "Coordinator: " << coordinator << std::endl;
  std::cout << "Nucleus URL: " << nucleus << std::endl;

  OmniverseConnector connector(coordinator, nucleus);
  if (!connector.start()) {
    std::cerr << "Failed to start connector" << std::endl;
    return 1;
  }

  std::cout << "Connector running. Press Enter to stop..." << std::endl;
  std::cin.get();

  connector.stop();
  return 0;
}

