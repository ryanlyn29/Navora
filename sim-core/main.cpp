#include "simulator.h"
#include "scene/scene_graph.h"
#include "physics/rigid_body.h"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
  navora::Simulator sim;

  auto* floor = sim.get_scene().create_entity("floor");
  floor->body.is_static = true;
  floor->body.shape.type = navora::physics::ShapeType::PLANE;
  floor->body.shape.normal = navora::physics::Vector3(0, 1, 0);
  floor->body.shape.offset = 0.0;
  floor->body.transform.position = navora::physics::Vector3(0, -5, 0);

  auto* sphere = sim.get_scene().create_entity("sphere_0");
  sphere->body.mass = 1.0;
  sphere->body.inv_mass = 1.0;
  sphere->body.shape.type = navora::physics::ShapeType::SPHERE;
  sphere->body.shape.size = navora::physics::Vector3(1.0, 1.0, 1.0);
  sphere->body.transform.position = navora::physics::Vector3(0, 5, 0);

  sim.start();

  const double delta_time = navora::physics::DEFAULT_DELTA_TIME;
  const auto target_duration = std::chrono::duration<double>(delta_time);

  for (int i = 0; i < 600; ++i) {
    auto start = std::chrono::steady_clock::now();
    sim.tick(delta_time);

    if (i % 60 == 0) {
      auto* s = sim.get_scene().get_entity("sphere_0");
      if (s) {
        std::cout << "Tick " << sim.get_tick() << " | Time " << sim.get_sim_time()
                  << " | Pos (" << s->body.transform.position.x << ", "
                  << s->body.transform.position.y << ", "
                  << s->body.transform.position.z << ")\n";
      }
    }

    auto end = std::chrono::steady_clock::now();
    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    auto sleep_time = target_duration - elapsed;
    if (sleep_time.count() > 0) {
      std::this_thread::sleep_for(sleep_time);
    }
  }

  return 0;
}

