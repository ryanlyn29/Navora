#pragma once

#include "../scene/scene_graph.h"
#include <string>
#include <vector>

namespace navora::usd {

struct USDNode {
  std::string path;
  std::string type;
  std::vector<std::pair<std::string, std::string>> attributes;
  std::vector<std::string> children;
};

class USDExporter {
public:
  std::string export_scene(const scene::SceneGraph& graph) const;

private:
  std::string export_entity(const scene::Entity* entity, const scene::SceneGraph& graph, const std::string& indent) const;
};

}

