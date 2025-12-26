#include "integrator.h"
#include <cmath>

namespace navora::physics {

void Integrator::step(std::vector<RigidBody>& bodies, double delta_time) {
  apply_gravity(bodies, delta_time);
  integrate(bodies, delta_time);
  detect_collisions(bodies);
  resolve_collisions(bodies);
}

}

