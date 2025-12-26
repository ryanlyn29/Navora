#pragma once

#include "physics/integrator.h"
#include "physics/rigid_body.h"
#include <cstdint>
#include <string>
#include <functional>
#include <vector>
#include <unordered_map>

#ifdef USD_FOUND
#include "scene/usd_scene.h"
#else
#include "scene/scene_graph.h"
#endif

namespace navora {

class Simulator {
public:
  static constexpr double FIXED_DT = 1.0 / 60.0;

  Simulator() : running_(false), tick_(0), sim_time_(0.0) {}

  void start() {
    running_ = true;
  }

  void stop() {
    running_ = false;
  }

  void tick();

#ifdef USD_FOUND
  scene::USDScene& get_scene() { return scene_; }
  const scene::USDScene& get_scene() const { return scene_; }
#endif

  bool create_entity(const std::string& id, const physics::RigidBody& body);
  bool get_entity(const std::string& id, physics::RigidBody& body) const;
  bool update_entity(const std::string& id, const physics::RigidBody& body);
  bool remove_entity(const std::string& id);
  std::vector<std::string> get_all_entity_ids() const;

  bool is_running() const { return running_; }
  uint64_t get_tick() const { return tick_; }
  double get_sim_time() const { return sim_time_; }
  double get_fixed_dt() const { return FIXED_DT; }
  void reset();

private:
#ifdef USD_FOUND
  scene::USDScene scene_;
#else
  scene::SceneGraph scene_graph_;
  std::unordered_map<std::string, physics::RigidBody> entities_;
#endif
  physics::Integrator integrator_;
  bool running_;
  uint64_t tick_;
  double sim_time_;
};

}

