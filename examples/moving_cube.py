#!/usr/bin/env python3

from sim.engine import SimulationEngine
from sim.entities import Entity, Vector3
from usd.writer import USDWriter
import os


def main():
    output_path = "output/moving_cube.usda"
    os.makedirs("output", exist_ok=True)
    
    engine = SimulationEngine()
    
    floor = engine.create_entity("floor")
    floor.body.is_static = True
    floor.shape_type = "plane"
    floor.shape_size = Vector3(100.0, 100.0, 1.0)
    floor.transform.position = Vector3(0, 0, 0)
    
    cube = engine.create_entity("cube")
    cube.body.mass = 1.0
    cube.shape_type = "sphere"
    cube.shape_size = Vector3(1.0, 1.0, 1.0)
    cube.transform.position = Vector3(0, 10, 0)
    
    writer = USDWriter(output_path)
    
    engine.start()
    
    duration = 5.0
    fps = 60
    total_frames = int(duration * fps)
    
    for frame in range(total_frames):
        time = frame / fps
        
        engine.tick()
        
        if frame % 1 == 0:
            writer.write_frame(engine.get_all_entities(), time)
    
    writer.save()
    
    print(f"Generated USD file: {output_path}")
    print(f"Duration: {duration}s, Frames: {total_frames}")
    print(f"Final tick: {engine.tick_count}, Final time: {engine.sim_time:.2f}s")
    print(f"\nTo view in Blender:")
    print(f"  1. Open Blender 4.x or later")
    print(f"  2. File > Import > Universal Scene Description (.usd/.usda)")
    print(f"  3. Select: {os.path.abspath(output_path)}")
    print(f"  4. Press Home to frame scene")
    print(f"  5. Scrub timeline to see animation")
    print(f"\nNote: The world is pre-rotated +90° around X for Blender compatibility.")
    print(f"      You should see a horizontal plane with a ball above it.")


if __name__ == "__main__":
    main()

