#include "simulator.h"

namespace navora {

void Simulator::tick() {
  if (!running_) return;

  const double dt = FIXED_DT;

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

  tick_++;
  sim_time_ += dt;
}

void Simulator::reset() {
  tick_ = 0;
  sim_time_ = 0.0;
  scene_.clear();
}

}

