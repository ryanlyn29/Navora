#pragma once

#include "rigid_body.h"
#include <vector>
#include <cstdint>
#include <cmath>
#include <algorithm>

namespace navora::physics {

constexpr double GRAVITY = -9.81;
constexpr double DEFAULT_DELTA_TIME = 1.0 / 60.0;

struct Contact {
  Vector3 point;
  Vector3 normal;
  double penetration;
  RigidBody* body_a;
  RigidBody* body_b;
};

class Integrator {
public:
  void step(std::vector<RigidBody>& bodies, double delta_time);

private:
  void apply_gravity(std::vector<RigidBody>& bodies, double delta_time) {
    Vector3 gravity_force(0, GRAVITY, 0);
    for (auto& body : bodies) {
      if (!body.is_static) {
        body.apply_force(gravity_force * body.mass, delta_time);
      }
    }
  }

  void integrate(std::vector<RigidBody>& bodies, double delta_time) {
    for (auto& body : bodies) {
      body.integrate(delta_time);
    }
  }

  void detect_collisions(std::vector<RigidBody>& bodies) {
    contacts_.clear();
    for (size_t i = 0; i < bodies.size(); ++i) {
      for (size_t j = i + 1; j < bodies.size(); ++j) {
        check_collision(bodies[i], bodies[j]);
      }
    }
  }

  void check_collision(RigidBody& a, RigidBody& b) {
    if (a.is_static && b.is_static) return;

    if (a.shape.type == ShapeType::SPHERE && b.shape.type == ShapeType::SPHERE) {
      check_sphere_sphere(a, b);
    } else if (a.shape.type == ShapeType::SPHERE && b.shape.type == ShapeType::PLANE) {
      check_sphere_plane(a, b);
    } else if (a.shape.type == ShapeType::PLANE && b.shape.type == ShapeType::SPHERE) {
      check_sphere_plane(b, a);
    }
  }

  void check_sphere_sphere(RigidBody& a, RigidBody& b) {
    Vector3 diff = b.transform.position - a.transform.position;
    double dist_sq = diff.length_squared();
    double radius_a = a.shape.size.x;
    double radius_b = b.shape.size.x;
    double min_dist = radius_a + radius_b;

    if (dist_sq < min_dist * min_dist) {
      Contact contact;
      contact.body_a = &a;
      contact.body_b = &b;
      double dist = sqrt(dist_sq);
      contact.normal = (dist > 1e-9) ? diff * (1.0 / dist) : Vector3(0, 1, 0);
      contact.penetration = min_dist - dist;
      contact.point = a.transform.position + contact.normal * radius_a;
      contacts_.push_back(contact);
    }
  }

  void check_sphere_plane(RigidBody& sphere, RigidBody& plane) {
    if (plane.is_static) {
      Vector3 plane_normal = plane.shape.normal.normalized();
      Vector3 sphere_to_plane = sphere.transform.position - plane.transform.position;
      double distance = sphere_to_plane.dot(plane_normal);
      double radius = sphere.shape.size.x;
      double plane_offset = plane.shape.offset;

      if (distance - radius < plane_offset) {
        Contact contact;
        contact.body_a = &sphere;
        contact.body_b = &plane;
        contact.normal = plane_normal;
        contact.penetration = plane_offset - (distance - radius);
        contact.point = sphere.transform.position - plane_normal * radius;
        contacts_.push_back(contact);
      }
    }
  }

  void resolve_collisions(std::vector<RigidBody>& bodies) {
    const double restitution = 0.3;
    const double friction = 0.5;

    for (auto& contact : contacts_) {
      RigidBody* a = contact.body_a;
      RigidBody* b = contact.body_b;

      Vector3 relative_vel = b->linear_velocity - a->linear_velocity;
      double vel_along_normal = relative_vel.dot(contact.normal);

      if (vel_along_normal > 0) continue;

      double inv_mass_sum = a->inv_mass + b->inv_mass;
      if (inv_mass_sum < 1e-9) continue;

      double j = -(1.0 + restitution) * vel_along_normal / inv_mass_sum;

      Vector3 impulse = contact.normal * j;
      a->apply_impulse(impulse * -1.0);
      b->apply_impulse(impulse);

      a->transform.position += contact.normal * (contact.penetration * a->inv_mass / inv_mass_sum);
      b->transform.position -= contact.normal * (contact.penetration * b->inv_mass / inv_mass_sum);

      relative_vel = b->linear_velocity - a->linear_velocity;
      Vector3 tangent = relative_vel - contact.normal * relative_vel.dot(contact.normal);
      if (tangent.length_squared() > 1e-9) {
        tangent = tangent.normalized();
        double jt = -relative_vel.dot(tangent) / inv_mass_sum;
        double mu = friction;
        Vector3 friction_impulse = tangent * (jt < j * mu ? jt : j * mu);
        a->apply_impulse(friction_impulse * -1.0);
        b->apply_impulse(friction_impulse);
      }
    }
  }

  std::vector<Contact> contacts_;
};

}

