#include "usd_export.h"
#include "../physics/rigid_body.h"

namespace navora::usd {

std::string USDExporter::export_scene(const scene::SceneGraph& graph) const {
  std::string result = "#usda 1.0\n\n";
  result += "def Xform \"World\" {\n";

  auto entities = graph.get_all_entities();
  for (auto* entity : entities) {
    if (entity->parent_id.empty()) {
      result += export_entity(entity, graph, "    ");
    }
  }

  result += "}\n";
  return result;
}

std::string USDExporter::export_entity(const scene::Entity* entity, const scene::SceneGraph& graph, const std::string& indent) const {
  std::string result = indent + "def Xform \"" + entity->id + "\" {\n";
  result += indent + "    double3 xformOp:translate = (" +
            std::to_string(entity->body.transform.position.x) + ", " +
            std::to_string(entity->body.transform.position.y) + ", " +
            std::to_string(entity->body.transform.position.z) + ")\n";
  result += indent + "    uniform token[] xformOpOrder = [\"xformOp:translate\"]\n";

  if (entity->body.shape.type == physics::ShapeType::SPHERE) {
    result += indent + "    def Sphere \"Shape\" {\n";
    result += indent + "        double radius = " + std::to_string(entity->body.shape.size.x) + "\n";
    result += indent + "    }\n";
  }

    for (const auto& child_id : entity->child_ids) {
      const scene::Entity* child = graph.get_entity(child_id);
      if (child) {
        result += export_entity(child, graph, indent + "    ");
      }
    }

  result += indent + "}\n";
  return result;
}

}

