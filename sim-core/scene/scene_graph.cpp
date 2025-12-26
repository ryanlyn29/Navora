#include "scene_graph.h"
#include <algorithm>

namespace navora::scene {

void SceneGraph::set_parent(const std::string& child_id, const std::string& parent_id) {
  Entity* child = get_entity(child_id);
  Entity* parent = get_entity(parent_id);
  if (!child || !parent) return;

  if (!child->parent_id.empty()) {
    Entity* old_parent = get_entity(child->parent_id);
    if (old_parent) {
      old_parent->child_ids.erase(
        std::remove(old_parent->child_ids.begin(), old_parent->child_ids.end(), child_id),
        old_parent->child_ids.end()
      );
    }
  }

  child->parent_id = parent_id;
  parent->child_ids.push_back(child_id);
}

}

