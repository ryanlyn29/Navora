#include "usd_scene.h"
#include <pxr/base/gf/vec3d.h>
#include <pxr/base/gf/quatd.h>
#include <pxr/usd/usdGeom/xformCommonAPI.h>
#include <pxr/usd/usdPhysics/massAPI.h>

namespace navora::scene {

USDScene::USDScene() {
  stage_ = pxr::UsdStage::CreateInMemory();
  auto root = pxr::UsdGeomXform::Define(stage_, pxr::SdfPath("/World"));
  auto entities = pxr::UsdGeomXform::Define(stage_, pxr::SdfPath("/World/Entities"));
}

std::string USDScene::entity_id_to_path(const std::string& id) const {
  return "/World/Entities/" + id;
}

std::string USDScene::path_to_entity_id(const std::string& path) const {
  const std::string prefix = "/World/Entities/";
  if (path.find(prefix) == 0) {
    return path.substr(prefix.length());
  }
  return "";
}

bool USDScene::create_entity(const std::string& id, const physics::RigidBody& body) {
  std::string path_str = entity_id_to_path(id);
  pxr::SdfPath path(path_str);

  if (entity_to_path_.find(id) != entity_to_path_.end()) {
    return false;
  }

  auto xform = create_xform_prim(path_str, body.transform);
  if (!xform) {
    return false;
  }

  pxr::UsdPrim prim = xform.GetPrim();
  apply_physics_schema(prim, body);
  create_collision_shape(prim, body.shape);

  entity_to_path_[id] = path;
  path_to_entity_[path] = id;
  return true;
}

bool USDScene::remove_entity(const std::string& id) {
  auto it = entity_to_path_.find(id);
  if (it == entity_to_path_.end()) {
    return false;
  }

  pxr::SdfPath path = it->second;
  stage_->RemovePrim(path);
  entity_to_path_.erase(it);
  path_to_entity_.erase(path);
  return true;
}

bool USDScene::update_entity(const std::string& id, const physics::RigidBody& body) {
  auto it = entity_to_path_.find(id);
  if (it == entity_to_path_.end()) {
    return false;
  }

  pxr::SdfPath path = it->second;
  auto prim = stage_->GetPrimAtPath(path);
  if (!prim.IsValid()) {
    return false;
  }

  auto xform = pxr::UsdGeomXform(prim);
  update_xform_prim(xform, body.transform);
  apply_physics_schema(prim, body);
  return true;
}

bool USDScene::get_entity(const std::string& id, physics::RigidBody& body) const {
  auto it = entity_to_path_.find(id);
  if (it == entity_to_path_.end()) {
    return false;
  }

  pxr::SdfPath path = it->second;
  auto prim = stage_->GetPrimAtPath(path);
  if (!prim.IsValid()) {
    return false;
  }

  auto xform = pxr::UsdGeomXform(prim);
  pxr::GfMatrix4d local_xform;
  bool reset_xform_stack;
  xform.GetLocalTransformation(&local_xform, &reset_xform_stack);

  pxr::GfVec3d translation;
  pxr::GfQuatd rotation;
  pxr::GfVec3d scale;
  pxr::UsdGeomXformCommonAPI::GetRotationOrderValue(pxr::UsdGeomXformCommonAPI::RotationOrderXYZ);
  local_xform.Factor(&translation, &rotation, &scale, nullptr);

  body.transform.position.x = translation[0];
  body.transform.position.y = translation[1];
  body.transform.position.z = translation[2];
  body.transform.rotation.x = rotation.GetImaginary()[0];
  body.transform.rotation.y = rotation.GetImaginary()[1];
  body.transform.rotation.z = rotation.GetImaginary()[2];
  body.transform.rotation.w = rotation.GetReal();
  body.transform.scale.x = scale[0];
  body.transform.scale.y = scale[1];
  body.transform.scale.z = scale[2];

  auto rigid_body_api = pxr::UsdPhysicsRigidBodyAPI(prim);
  if (rigid_body_api) {
    pxr::GfVec3f linear_velocity;
    if (rigid_body_api.GetVelocityAttr().Get(&linear_velocity)) {
      body.linear_velocity.x = linear_velocity[0];
      body.linear_velocity.y = linear_velocity[1];
      body.linear_velocity.z = linear_velocity[2];
    }

    pxr::GfVec3f angular_velocity;
    if (rigid_body_api.GetAngularVelocityAttr().Get(&angular_velocity)) {
      body.angular_velocity.x = angular_velocity[0];
      body.angular_velocity.y = angular_velocity[1];
      body.angular_velocity.z = angular_velocity[2];
    }
  }

  auto mass_api = pxr::UsdPhysicsMassAPI(prim);
  if (mass_api) {
    double mass = 1.0;
    if (mass_api.GetMassAttr().Get(&mass)) {
      body.mass = mass;
      body.inv_mass = (mass > 0.0) ? 1.0 / mass : 0.0;
    }
  }

  auto collision_api = pxr::UsdPhysicsCollisionAPI(prim);
  if (collision_api) {
    bool collision_enabled = true;
    if (collision_api.GetCollisionEnabledAttr().Get(&collision_enabled)) {
      body.is_static = !collision_enabled;
    }
  }

  return true;
}

std::vector<std::string> USDScene::get_all_entity_ids() const {
  std::vector<std::string> result;
  for (const auto& [id, path] : entity_to_path_) {
    result.push_back(id);
  }
  return result;
}

void USDScene::clear() {
  for (const auto& [id, path] : entity_to_path_) {
    stage_->RemovePrim(path);
  }
  entity_to_path_.clear();
  path_to_entity_.clear();
}

pxr::UsdGeomXform USDScene::create_xform_prim(const std::string& path, const physics::Transform& transform) {
  pxr::SdfPath sdf_path(path);
  auto xform = pxr::UsdGeomXform::Define(stage_, sdf_path);

  pxr::GfVec3d translation(transform.position.x, transform.position.y, transform.position.z);
  pxr::GfQuatd rotation(transform.rotation.w, transform.rotation.x, transform.rotation.y, transform.rotation.z);
  pxr::GfVec3d scale(transform.scale.x, transform.scale.y, transform.scale.z);

  auto xform_api = pxr::UsdGeomXformCommonAPI(xform);
  xform_api.SetTranslate(translation);
  xform_api.SetRotate(rotation);
  xform_api.SetScale(scale);

  return xform;
}

void USDScene::update_xform_prim(pxr::UsdGeomXform xform, const physics::Transform& transform) {
  pxr::GfVec3d translation(transform.position.x, transform.position.y, transform.position.z);
  pxr::GfQuatd rotation(transform.rotation.w, transform.rotation.x, transform.rotation.y, transform.rotation.z);
  pxr::GfVec3d scale(transform.scale.x, transform.scale.y, transform.scale.z);

  auto xform_api = pxr::UsdGeomXformCommonAPI(xform);
  xform_api.SetTranslate(translation);
  xform_api.SetRotate(rotation);
  xform_api.SetScale(scale);
}

void USDScene::apply_physics_schema(pxr::UsdPrim prim, const physics::RigidBody& body) {
  auto rigid_body_api = pxr::UsdPhysicsRigidBodyAPI::Apply(prim);
  if (rigid_body_api) {
    pxr::GfVec3f linear_velocity(body.linear_velocity.x, body.linear_velocity.y, body.linear_velocity.z);
    rigid_body_api.GetVelocityAttr().Set(linear_velocity);

    pxr::GfVec3f angular_velocity(body.angular_velocity.x, body.angular_velocity.y, body.angular_velocity.z);
    rigid_body_api.GetAngularVelocityAttr().Set(angular_velocity);
  }

  auto mass_api = pxr::UsdPhysicsMassAPI::Apply(prim);
  if (mass_api) {
    mass_api.GetMassAttr().Set(body.mass);
  }

  auto collision_api = pxr::UsdPhysicsCollisionAPI::Apply(prim);
  if (collision_api) {
    collision_api.GetCollisionEnabledAttr().Set(!body.is_static);
  }
}

void USDScene::create_collision_shape(pxr::UsdPrim parent, const physics::CollisionShape& shape) {
  if (shape.type == physics::ShapeType::SPHERE) {
    auto sphere = pxr::UsdGeomSphere::Define(stage_, parent.GetPath().AppendChild(pxr::TfToken("Shape")));
    sphere.GetRadiusAttr().Set(shape.size.x);
  } else if (shape.type == physics::ShapeType::PLANE) {
    auto mesh = pxr::UsdGeomMesh::Define(stage_, parent.GetPath().AppendChild(pxr::TfToken("Shape")));
    pxr::VtVec3fArray points = {
      pxr::GfVec3f(-100, 0, -100),
      pxr::GfVec3f(100, 0, -100),
      pxr::GfVec3f(100, 0, 100),
      pxr::GfVec3f(-100, 0, 100)
    };
    pxr::VtIntArray face_vertex_counts = {4};
    pxr::VtIntArray face_vertex_indices = {0, 1, 2, 3};
    mesh.GetPointsAttr().Set(points);
    mesh.GetFaceVertexCountsAttr().Set(face_vertex_counts);
    mesh.GetFaceVertexIndicesAttr().Set(face_vertex_indices);
  }
}

}

