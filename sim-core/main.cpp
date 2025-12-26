#include "simulator.h"
#include "physics/rigid_body.h"
#include <iostream>

int main() {
  navora::Simulator sim;

#ifdef USD_FOUND
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
#endif

  sim.start();

  for (int i = 0; i < 600; ++i) {
    sim.tick();

    if (i % 60 == 0) {
      std::cout << "Tick " << sim.get_tick() << " | Time " << sim.get_sim_time() << "\n";
    }
  }

  return 0;
}

