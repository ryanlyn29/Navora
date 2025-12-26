#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sim.engine import SimulationEngine
from sim.entities import Entity, Vector3

def write_usd_ascii(filepath, entities_history, duration, fps):
    total_frames = len(entities_history)
    
    with open(filepath, 'w') as f:
        f.write("#usda 1.0\n")
        f.write("(\n")
        f.write(f"    startTimeCode = 0\n")
        f.write(f"    endTimeCode = {total_frames - 1}\n")
        f.write(f"    timeCodesPerSecond = {fps}\n")
        f.write("    upAxis = \"Z\"\n")
        f.write("    metersPerUnit = 1.0\n")
        f.write("    defaultPrim = \"World\"\n")
        f.write(")\n\n")
        
        f.write("def Xform \"World\" (\n")
        f.write("    kind = \"group\"\n")
        f.write(")\n")
        f.write("{\n")
        f.write("    double3 xformOp:rotateXYZ = (90, 0, 0)\n")
        f.write("    uniform token[] xformOpOrder = [\"xformOp:rotateXYZ\"]\n\n")
        
        f.write('    def Camera "defaultCamera"\n')
        f.write("    {\n")
        f.write("        float3 xformOp:translate = (6, -6, 4)\n")
        f.write("        float3 xformOp:rotateXYZ = (63.4349, 0, 45)\n")
        f.write("        uniform token[] xformOpOrder = [\"xformOp:translate\", \"xformOp:rotateXYZ\"]\n")
        f.write("        token projection = \"perspective\"\n")
        f.write("        float focalLength = 50.0\n")
        f.write("        float horizontalAperture = 20.955\n")
        f.write("        float verticalAperture = 15.955\n")
        f.write("        float2 clippingRange = (0.1, 1000.0)\n")
        f.write("    }\n\n")
        
        entity_ids = set()
        for frame_data in entities_history:
            for entity in frame_data:
                entity_ids.add(entity.id)
        
        for entity_id in entity_ids:
            f.write(f'    def Xform "{entity_id}"\n')
            f.write("    {\n")
            
            f.write("        double3 xformOp:translate.timeSamples = {\n")
            for frame_idx, frame_data in enumerate(entities_history):
                entity = next((e for e in frame_data if e.id == entity_id), None)
                if entity:
                    usd_x = entity.transform.position.x
                    usd_y = entity.transform.position.z
                    usd_z = entity.transform.position.y
                    f.write(f"            {frame_idx}: ({usd_x}, {usd_y}, {usd_z}),\n")
            f.write("        }\n")
            f.write("        uniform token[] xformOpOrder = [\"xformOp:translate\"]\n")
            
            xform_order = ["xformOp:translate"]
            
            first_entity = next((e for e in entities_history[0] if e.id == entity_id), None)
            if first_entity:
                if first_entity.shape_type == "sphere":
                    f.write(f'        def Sphere "Shape"\n')
                    f.write("        {\n")
                    f.write(f"            double radius = {first_entity.shape_size.x}\n")
                    f.write(f'            rel material:binding = </World/{entity_id}/Material>\n')
                    f.write("        }\n")
                    f.write(f'        def Material "Material"\n')
                    f.write("        {\n")
                    f.write(f'            token outputs:surface.connect = </World/{entity_id}/Material/Surface.outputs:surface>\n')
                    f.write('            def Shader "Surface"\n')
                    f.write("            {\n")
                    f.write('                uniform token info:id = "UsdPreviewSurface"\n')
                    f.write("                color3f inputs:diffuseColor = (0.2, 0.5, 1.0)\n")
                    f.write("                float inputs:roughness = 0.5\n")
                    f.write("                float inputs:metallic = 0.0\n")
                    f.write("            }\n")
                    f.write("        }\n")
                elif first_entity.shape_type == "plane":
                    f.write(f'        def Mesh "Shape"\n')
                    f.write("        {\n")
                    size = first_entity.shape_size.x
                    f.write("            point3f[] points = [\n")
                    f.write(f"                ({-size}, {-size}, 0),\n")
                    f.write(f"                ({size}, {-size}, 0),\n")
                    f.write(f"                ({size}, {size}, 0),\n")
                    f.write(f"                ({-size}, {size}, 0)\n")
                    f.write("            ]\n")
                    f.write("            int[] faceVertexCounts = [4]\n")
                    f.write("            int[] faceVertexIndices = [0, 3, 2, 1]\n")
                    f.write("            normal3f[] normals = [(0, 0, 1), (0, 0, 1), (0, 0, 1), (0, 0, 1)]\n")
                    f.write("            uniform token orientation = \"rightHanded\"\n")
                    f.write("            uniform bool doubleSided = true\n")
                    f.write(f'            rel material:binding = </World/{entity_id}/Material>\n')
                    f.write("        }\n")
                    f.write('        def Material "Material"\n')
                    f.write("        {\n")
                    f.write(f'            token outputs:surface.connect = </World/{entity_id}/Material/Surface.outputs:surface>\n')
                    f.write('            def Shader "Surface"\n')
                    f.write("            {\n")
                    f.write('                uniform token info:id = "UsdPreviewSurface"\n')
                    f.write("                color3f inputs:diffuseColor = (0.7, 0.7, 0.7)\n")
                    f.write("                float inputs:roughness = 0.8\n")
                    f.write("                float inputs:metallic = 0.0\n")
                    f.write("            }\n")
                    f.write("        }\n")
            
            f.write("    }\n\n")
        
        f.write("}\n")

def main():
    output_path = "output/moving_cube.usda"
    os.makedirs("output", exist_ok=True)
    
    engine = SimulationEngine()
    
    floor = engine.create_entity("floor")
    floor.body.is_static = True
    floor.shape_type = "plane"
    floor.shape_size = Vector3(20.0, 20.0, 1.0)
    floor.transform.position = Vector3(0, 0, 0)
    
    cube = engine.create_entity("cube")
    cube.body.mass = 1.0
    cube.shape_type = "sphere"
    cube.shape_size = Vector3(0.5, 0.5, 0.5)
    cube.transform.position = Vector3(0, 3, 0)
    
    engine.start()
    
    duration = 5.0
    fps = 60
    total_frames = int(duration * fps)
    
    entities_history = []
    
    for frame in range(total_frames):
        engine.tick()
        if frame % 1 == 0:
            frame_snapshot = []
            for entity in engine.get_all_entities():
                snapshot = Entity(entity.id)
                snapshot.transform.position = Vector3(entity.transform.position.x, entity.transform.position.y, entity.transform.position.z)
                snapshot.body.mass = entity.body.mass
                snapshot.body.is_static = entity.body.is_static
                snapshot.shape_type = entity.shape_type
                snapshot.shape_size = Vector3(entity.shape_size.x, entity.shape_size.y, entity.shape_size.z)
                frame_snapshot.append(snapshot)
            entities_history.append(frame_snapshot)
    
    write_usd_ascii(output_path, entities_history, duration, fps)
    
    abs_path = os.path.abspath(output_path)
    print(f"Generated USD file: {abs_path}")
    print(f"Duration: {duration}s, Frames: {total_frames}")
    print(f"Final tick: {engine.tick_count}, Final time: {engine.sim_time:.2f}s")
    print(f"\nTo view in Blender:")
    print(f"  1. Open Blender 4.x or later")
    print(f"  2. File > Import > Universal Scene Description (.usd/.usda)")
    print(f"  3. Select: {abs_path}")
    print(f"  4. Press Home to frame scene")
    print(f"  5. Scrub timeline to see animation")
    print(f"\nNote: The world is pre-rotated +90° around X for Blender compatibility.")
    print(f"      You should see a horizontal plane with a ball above it.")

if __name__ == "__main__":
    main()

