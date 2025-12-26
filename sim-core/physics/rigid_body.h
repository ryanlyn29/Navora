#pragma once

#include <cstdint>
#include <cmath>

namespace navora::physics {

struct Vector3 {
  double x = 0.0;
  double y = 0.0;
  double z = 0.0;

  Vector3() = default;
  Vector3(double x, double y, double z) : x(x), y(y), z(z) {}

  Vector3 operator+(const Vector3& other) const {
    return Vector3(x + other.x, y + other.y, z + other.z);
  }

  Vector3 operator-(const Vector3& other) const {
    return Vector3(x - other.x, y - other.y, z - other.z);
  }

  Vector3 operator*(double scalar) const {
    return Vector3(x * scalar, y * scalar, z * scalar);
  }

  Vector3& operator+=(const Vector3& other) {
    x += other.x;
    y += other.y;
    z += other.z;
    return *this;
  }

  Vector3& operator-=(const Vector3& other) {
    x -= other.x;
    y -= other.y;
    z -= other.z;
    return *this;
  }

  double dot(const Vector3& other) const {
    return x * other.x + y * other.y + z * other.z;
  }

  double length_squared() const {
    return x * x + y * y + z * z;
  }

  double length() const {
    return sqrt(length_squared());
  }

  Vector3 normalized() const {
    double len = length();
    if (len < 1e-9) return Vector3(0, 0, 0);
    return *this * (1.0 / len);
  }
};

struct Quaternion {
  double x = 0.0;
  double y = 0.0;
  double z = 0.0;
  double w = 1.0;

  Quaternion() = default;
  Quaternion(double x, double y, double z, double w) : x(x), y(y), z(z), w(w) {}
};

struct Transform {
  Vector3 position;
  Quaternion rotation;
  Vector3 scale;

  Transform() : scale(1.0, 1.0, 1.0) {}
};

enum class ShapeType {
  SPHERE,
  PLANE,
  AABB
};

struct CollisionShape {
  ShapeType type = ShapeType::SPHERE;
  Vector3 size;
  Vector3 normal;
  double offset = 0.0;
};

struct RigidBody {
  Transform transform;
  Vector3 linear_velocity;
  Vector3 angular_velocity;
  double mass = 1.0;
  double inv_mass = 1.0;
  CollisionShape shape;
  bool is_static = false;

  RigidBody() {
    shape.type = ShapeType::SPHERE;
    shape.size = Vector3(1.0, 1.0, 1.0);
  }

  void apply_force(const Vector3& force, double delta_time) {
    if (is_static) return;
    linear_velocity = linear_velocity + force * (inv_mass * delta_time);
  }

  void apply_impulse(const Vector3& impulse) {
    if (is_static) return;
    linear_velocity = linear_velocity + impulse * inv_mass;
  }

  void integrate(double delta_time) {
    if (is_static) return;
    transform.position = transform.position + linear_velocity * delta_time;
  }
};

}

