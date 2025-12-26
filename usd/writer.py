from pxr import Usd, UsdGeom, Gf, Sdf
from typing import List
from sim.entities import Entity
from .stage import create_stage
from .schemas import create_sphere_prim, create_plane_mesh, apply_physics_schemas


class USDWriter:
    def __init__(self, filepath: str):
        self.stage = create_stage(filepath)
        self.world_path = Sdf.Path("/World")
        self.entity_prims = {}

    def create_entity_prim(self, entity: Entity):
        entity_path = self.world_path.AppendChild(entity.id)
        
        xform = UsdGeom.Xform.Define(self.stage, entity_path)
        self.entity_prims[entity.id] = xform
        
        if entity.shape_type == "sphere":
            create_sphere_prim(self.stage, entity_path, "Shape", entity.shape_size.x)
        elif entity.shape_type == "plane":
            create_plane_mesh(self.stage, entity_path, "Shape", entity.shape_size.x)
        
        apply_physics_schemas(xform.GetPrim(), entity)
        
        return xform

    def update_transform(self, entity: Entity, time: float):
        if entity.id not in self.entity_prims:
            self.create_entity_prim(entity)
        
        xform = self.entity_prims[entity.id]
        xform_api = UsdGeom.XformCommonAPI(xform)
        
        translation = Gf.Vec3d(
            entity.transform.position.x,
            entity.transform.position.z,
            entity.transform.position.y
        )
        
        rotation = Gf.Quatd(1.0, 0, 0, 0)
        
        scale = Gf.Vec3d(
            entity.transform.scale.x,
            entity.transform.scale.y,
            entity.transform.scale.z
        )
        
        xform_api.SetTranslate(translation, time)
        xform_api.SetRotate(rotation, time)
        xform_api.SetScale(scale, time)

    def write_frame(self, entities: List[Entity], time: float):
        for entity in entities:
            self.update_transform(entity, time)

    def save(self):
        self.stage.GetRootLayer().Save()

