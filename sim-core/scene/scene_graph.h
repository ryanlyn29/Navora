#pragma once

#include "../physics/rigid_body.h"
#include <string>
#include <unordered_map>
#include <vector>
#include <memory>
#include <algorithm>

namespace navora::scene {

struct Entity {
  std::string id;
  physics::RigidBody body;
  std::string parent_id;
  std::vector<std::string> child_ids;

  Entity(const std::string& id) : id(id) {}
};

class SceneGraph {
public:
  Entity* create_entity(const std::string& id) {
    auto entity = std::make_unique<Entity>(id);
    Entity* ptr = entity.get();
    entities_[id] = std::move(entity);
    return ptr;
  }

  void remove_entity(const std::string& id) {
    auto it = entities_.find(id);
    if (it != entities_.end()) {
      Entity* entity = it->second.get();
      if (!entity->parent_id.empty()) {
        Entity* parent = get_entity(entity->parent_id);
        if (parent) {
          parent->child_ids.erase(
            std::remove(parent->child_ids.begin(), parent->child_ids.end(), id),
            parent->child_ids.end()
          );
        }
      }
      for (const auto& child_id : entity->child_ids) {
        Entity* child = get_entity(child_id);
        if (child) {
          child->parent_id.clear();
        }
      }
      entities_.erase(it);
    }
  }

  Entity* get_entity(const std::string& id) {
    auto it = entities_.find(id);
    return (it != entities_.end()) ? it->second.get() : nullptr;
  }

  const Entity* get_entity(const std::string& id) const {
    auto it = entities_.find(id);
    return (it != entities_.end()) ? it->second.get() : nullptr;
  }

  void set_parent(const std::string& child_id, const std::string& parent_id);

  std::vector<Entity*> get_all_entities() {
    std::vector<Entity*> result;
    for (auto& [id, entity] : entities_) {
      result.push_back(entity.get());
    }
    return result;
  }

  std::vector<const Entity*> get_all_entities() const {
    std::vector<const Entity*> result;
    for (const auto& [id, entity] : entities_) {
      result.push_back(entity.get());
    }
    return result;
  }

  void clear() {
    entities_.clear();
  }

private:
  std::unordered_map<std::string, std::unique_ptr<Entity>> entities_;
};

}

