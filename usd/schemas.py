from pxr import Usd, UsdGeom, UsdPhysics, Gf, Sdf
from typing import Optional
from sim.entities import Entity, Vector3


def create_sphere_prim(stage: Usd.Stage, parent_path: Sdf.Path, name: str, radius: float) -> UsdGeom.Sphere:
    sphere_path = parent_path.AppendChild(name)
    sphere = UsdGeom.Sphere.Define(stage, sphere_path)
    sphere.GetRadiusAttr().Set(radius)
    return sphere


def create_plane_mesh(stage: Usd.Stage, parent_path: Sdf.Path, name: str, size: float = 100.0) -> UsdGeom.Mesh:
    mesh_path = parent_path.AppendChild(name)
    mesh = UsdGeom.Mesh.Define(stage, mesh_path)
    
    points = [
        Gf.Vec3f(-size, 0, -size),
        Gf.Vec3f(size, 0, -size),
        Gf.Vec3f(size, 0, size),
        Gf.Vec3f(-size, 0, size)
    ]
    
    face_vertex_counts = [4]
    face_vertex_indices = [0, 1, 2, 3]
    
    mesh.GetPointsAttr().Set(points)
    mesh.GetFaceVertexCountsAttr().Set(face_vertex_counts)
    mesh.GetFaceVertexIndicesAttr().Set(face_vertex_indices)
    
    return mesh


def apply_physics_schemas(prim: Usd.Prim, entity: Entity):
    rigid_body_api = UsdPhysics.RigidBodyAPI.Apply(prim)
    if rigid_body_api:
        vel = Gf.Vec3f(
            entity.body.linear_velocity.x,
            entity.body.linear_velocity.y,
            entity.body.linear_velocity.z
        )
        rigid_body_api.GetVelocityAttr().Set(vel)
        
        angular_vel = Gf.Vec3f(
            entity.body.angular_velocity.x,
            entity.body.angular_velocity.y,
            entity.body.angular_velocity.z
        )
        rigid_body_api.GetAngularVelocityAttr().Set(angular_vel)
    
    mass_api = UsdPhysics.MassAPI.Apply(prim)
    if mass_api:
        mass_api.GetMassAttr().Set(entity.body.mass)
    
    collision_api = UsdPhysics.CollisionAPI.Apply(prim)
    if collision_api:
        collision_api.GetCollisionEnabledAttr().Set(not entity.body.is_static)

