#pragma once

#include "scene/usd_scene.h"
#include "physics/integrator.h"
#include <cstdint>
#include <string>
#include <functional>

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

  scene::USDScene& get_scene() { return scene_; }
  const scene::USDScene& get_scene() const { return scene_; }

  bool is_running() const { return running_; }
  uint64_t get_tick() const { return tick_; }
  double get_sim_time() const { return sim_time_; }
  double get_fixed_dt() const { return FIXED_DT; }
  void reset();

private:
  scene::USDScene scene_;
  physics::Integrator integrator_;
  bool running_;
  uint64_t tick_;
  double sim_time_;
};

}

