#include "simulator.h"

namespace navora {

void Simulator::tick() {
  if (!running_) return;

  const double dt = FIXED_DT;

#ifdef USD_FOUND
  auto entity_ids = scene_.get_all_entity_ids();
  std::vector<physics::RigidBody> bodies;
  std::vector<std::string> ids;

  for (const auto& id : entity_ids) {
    physics::RigidBody body;
    if (scene_.get_entity(id, body)) {
      bodies.push_back(body);
      ids.push_back(id);
    }
  }

  integrator_.step(bodies, dt);

  for (size_t i = 0; i < ids.size(); ++i) {
    scene_.update_entity(ids[i], bodies[i]);
  }
#else
  std::vector<physics::RigidBody> bodies;
  std::vector<std::string> ids;

  for (const auto& [id, body] : entities_) {
    bodies.push_back(body);
    ids.push_back(id);
  }

  integrator_.step(bodies, dt);

  for (size_t i = 0; i < ids.size(); ++i) {
    entities_[ids[i]] = bodies[i];
  }
#endif

  tick_++;
  sim_time_ += dt;
}

bool Simulator::create_entity(const std::string& id, const physics::RigidBody& body) {
#ifdef USD_FOUND
  return scene_.create_entity(id, body);
#else
  if (entities_.find(id) != entities_.end()) {
    return false;
  }
  entities_[id] = body;
  scene_graph_.create_entity(id);
  return true;
#endif
}

bool Simulator::get_entity(const std::string& id, physics::RigidBody& body) const {
#ifdef USD_FOUND
  return scene_.get_entity(id, body);
#else
  auto it = entities_.find(id);
  if (it != entities_.end()) {
    body = it->second;
    return true;
  }
  return false;
#endif
}

bool Simulator::update_entity(const std::string& id, const physics::RigidBody& body) {
#ifdef USD_FOUND
  return scene_.update_entity(id, body);
#else
  auto it = entities_.find(id);
  if (it != entities_.end()) {
    it->second = body;
    return true;
  }
  return false;
#endif
}

bool Simulator::remove_entity(const std::string& id) {
#ifdef USD_FOUND
  return scene_.remove_entity(id);
#else
  auto it = entities_.find(id);
  if (it != entities_.end()) {
    entities_.erase(it);
    scene_graph_.remove_entity(id);
    return true;
  }
  return false;
#endif
}

std::vector<std::string> Simulator::get_all_entity_ids() const {
#ifdef USD_FOUND
  return scene_.get_all_entity_ids();
#else
  std::vector<std::string> ids;
  for (const auto& [id, body] : entities_) {
    ids.push_back(id);
  }
  return ids;
#endif
}

void Simulator::reset() {
  tick_ = 0;
  sim_time_ = 0.0;
#ifdef USD_FOUND
  scene_.clear();
#else
  entities_.clear();
  scene_graph_.clear();
#endif
}

}

