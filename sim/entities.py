import math
from dataclasses import dataclass
from typing import Optional


@dataclass
class Contact:
    point: 'Vector3'
    normal: 'Vector3'
    penetration: float
    body_a: 'Entity'
    body_b: 'Entity'


@dataclass
class Vector3:
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0

    def __add__(self, other):
        return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __sub__(self, other):
        return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)

    def __mul__(self, scalar):
        return Vector3(self.x * scalar, self.y * scalar, self.z * scalar)

    def length(self):
        return math.sqrt(self.x * self.x + self.y * self.y + self.z * self.z)

    def normalized(self):
        length = self.length()
        if length < 1e-9:
            return Vector3(0, 0, 0)
        return self * (1.0 / length)


@dataclass
class Transform:
    position: Vector3 = None
    rotation: Vector3 = None
    scale: Vector3 = None

    def __post_init__(self):
        if self.position is None:
            self.position = Vector3()
        if self.rotation is None:
            self.rotation = Vector3()
        if self.scale is None:
            self.scale = Vector3(1.0, 1.0, 1.0)


@dataclass
class RigidBody:
    mass: float = 1.0
    linear_velocity: Vector3 = None
    angular_velocity: Vector3 = None
    is_static: bool = False

    def __post_init__(self):
        if self.linear_velocity is None:
            self.linear_velocity = Vector3()
        if self.angular_velocity is None:
            self.angular_velocity = Vector3()

    @property
    def inv_mass(self):
        return 1.0 / self.mass if self.mass > 0 and not self.is_static else 0.0


class Entity:
    def __init__(self, entity_id: str):
        self.id = entity_id
        self.transform = Transform()
        self.body = RigidBody()
        self.shape_type: str = "sphere"
        self.shape_size: Vector3 = Vector3(1.0, 1.0, 1.0)

    def apply_force(self, force: Vector3, dt: float):
        if self.body.is_static:
            return
        self.body.linear_velocity = self.body.linear_velocity + force * (self.body.inv_mass * dt)

    def apply_impulse(self, impulse: Vector3):
        if self.body.is_static:
            return
        self.body.linear_velocity = self.body.linear_velocity + impulse * self.body.inv_mass

    def integrate(self, dt: float):
        if self.body.is_static:
            return
        self.transform.position = self.transform.position + self.body.linear_velocity * dt

