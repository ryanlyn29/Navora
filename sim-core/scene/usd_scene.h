#pragma once

#include "../physics/rigid_body.h"
#include <pxr/usd/usd/stage.h>
#include <pxr/usd/usdGeom/xform.h>
#include <pxr/usd/usdGeom/sphere.h>
#include <pxr/usd/usdGeom/mesh.h>
#include <pxr/usd/usdPhysics/rigidBodyAPI.h>
#include <pxr/usd/usdPhysics/collisionAPI.h>
#include <string>
#include <unordered_map>
#include <vector>
#include <memory>

PXR_NAMESPACE_USING_DIRECTIVE

namespace navora::scene {

class USDScene {
public:
  USDScene();
  ~USDScene() = default;

  pxr::UsdStageRefPtr get_stage() const { return stage_; }

  bool create_entity(const std::string& id, const physics::RigidBody& body);
  bool remove_entity(const std::string& id);
  bool update_entity(const std::string& id, const physics::RigidBody& body);
  bool get_entity(const std::string& id, physics::RigidBody& body) const;

  std::vector<std::string> get_all_entity_ids() const;
  void clear();

  std::string entity_id_to_path(const std::string& id) const;
  std::string path_to_entity_id(const std::string& path) const;

private:
  pxr::UsdStageRefPtr stage_;
  std::unordered_map<std::string, pxr::SdfPath> entity_to_path_;
  std::unordered_map<pxr::SdfPath, std::string> path_to_entity_;

  pxr::UsdGeomXform create_xform_prim(const std::string& path, const physics::Transform& transform);
  void update_xform_prim(pxr::UsdGeomXform xform, const physics::Transform& transform);
  void apply_physics_schema(pxr::UsdPrim prim, const physics::RigidBody& body);
  void create_collision_shape(pxr::UsdPrim parent, const physics::CollisionShape& shape);
};

}

