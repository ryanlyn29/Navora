import math
from typing import List, Optional
from .entities import Entity, Vector3, Contact


GRAVITY = -9.81


def apply_gravity(entities: List[Entity], dt: float):
    gravity_force = Vector3(0, GRAVITY, 0)
    for entity in entities:
        if not entity.body.is_static:
            entity.apply_force(gravity_force * entity.body.mass, dt)


def detect_collisions(entities: List[Entity]) -> List[Contact]:
    contacts = []
    for i in range(len(entities)):
        for j in range(i + 1, len(entities)):
            a = entities[i]
            b = entities[j]
            if a.body.is_static and b.body.is_static:
                continue

            if a.shape_type == "sphere" and b.shape_type == "sphere":
                contact = check_sphere_sphere(a, b)
                if contact:
                    contacts.append(contact)
            elif a.shape_type == "sphere" and b.shape_type == "plane":
                contact = check_sphere_plane(a, b)
                if contact:
                    contacts.append(contact)
            elif a.shape_type == "plane" and b.shape_type == "sphere":
                contact = check_sphere_plane(b, a)
                if contact:
                    contacts.append(contact)

    return contacts


def check_sphere_sphere(a: Entity, b: Entity) -> Optional[Contact]:
    diff = b.transform.position - a.transform.position
    dist_sq = diff.x * diff.x + diff.y * diff.y + diff.z * diff.z
    radius_a = a.shape_size.x
    radius_b = b.shape_size.x
    min_dist = radius_a + radius_b

    if dist_sq < min_dist * min_dist:
        dist = math.sqrt(dist_sq)
        normal = diff.normalized() if dist > 1e-9 else Vector3(0, 1, 0)
        penetration = min_dist - dist
        point = a.transform.position + normal * radius_a
        return Contact(point, normal, penetration, a, b)
    return None


def check_sphere_plane(sphere: Entity, plane: Entity) -> Optional[Contact]:
    if not plane.body.is_static:
        return None

    plane_normal = Vector3(0, 1, 0)
    sphere_to_plane = sphere.transform.position - plane.transform.position
    distance = sphere_to_plane.y
    radius = sphere.shape_size.x
    plane_offset = 0.0

    if distance - radius < plane_offset:
        penetration = plane_offset - (distance - radius)
        point = sphere.transform.position - plane_normal * radius
        return Contact(point, plane_normal, penetration, sphere, plane)
    return None


def resolve_collisions(contacts: List[Contact], restitution: float = 0.3, friction: float = 0.5):
    for contact in contacts:
        a = contact.body_a
        b = contact.body_b

        relative_vel = b.body.linear_velocity - a.body.linear_velocity
        vel_along_normal = (relative_vel.x * contact.normal.x + 
                           relative_vel.y * contact.normal.y + 
                           relative_vel.z * contact.normal.z)

        if vel_along_normal > 0:
            continue

        inv_mass_sum = a.body.inv_mass + b.body.inv_mass
        if inv_mass_sum < 1e-9:
            continue

        j = -(1.0 + restitution) * vel_along_normal / inv_mass_sum
        impulse = contact.normal * j

        a.apply_impulse(impulse * -1.0)
        b.apply_impulse(impulse)

        a.transform.position = a.transform.position + contact.normal * (contact.penetration * a.body.inv_mass / inv_mass_sum)
        b.transform.position = b.transform.position - contact.normal * (contact.penetration * b.body.inv_mass / inv_mass_sum)

        relative_vel = b.body.linear_velocity - a.body.linear_velocity
        tangent = relative_vel - contact.normal * (relative_vel.x * contact.normal.x + 
                                                   relative_vel.y * contact.normal.y + 
                                                   relative_vel.z * contact.normal.z)
        tangent_len_sq = tangent.x * tangent.x + tangent.y * tangent.y + tangent.z * tangent.z
        if tangent_len_sq > 1e-9:
            tangent = tangent.normalized()
            jt = -(relative_vel.x * tangent.x + relative_vel.y * tangent.y + relative_vel.z * tangent.z) / inv_mass_sum
            mu = friction
            friction_impulse = tangent * (jt if abs(jt) < abs(j) * mu else j * mu)
            a.apply_impulse(friction_impulse * -1.0)
            b.apply_impulse(friction_impulse)

