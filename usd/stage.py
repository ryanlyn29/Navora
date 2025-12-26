from pxr import Usd, UsdGeom, Gf


def create_stage(filepath: str) -> Usd.Stage:
    stage = Usd.Stage.CreateNew(filepath)
    
    UsdGeom.SetStageUpAxis(stage, "Z")
    UsdGeom.SetStageMetersPerUnit(stage, 1.0)
    
    root_prim = stage.DefinePrim("/World", "Xform")
    stage.SetDefaultPrim(root_prim)
    
    world_xform = UsdGeom.Xform.Get(stage, "/World")
    xform_api = UsdGeom.XformCommonAPI(world_xform)
    from pxr import Gf
    rotation = Gf.Rotation(Gf.Vec3d(1, 0, 0), 90.0)
    xform_api.SetRotate(rotation.GetQuat())
    
    return stage


def get_world_xform(stage: Usd.Stage) -> UsdGeom.Xform:
    return UsdGeom.Xform.Get(stage, "/World")

