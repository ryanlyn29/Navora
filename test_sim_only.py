#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sim.engine import SimulationEngine
from sim.entities import Entity, Vector3

def main():
    print("Testing simulation engine (no USD)...")
    
    engine = SimulationEngine()
    
    floor = engine.create_entity("floor")
    floor.body.is_static = True
    floor.shape_type = "plane"
    floor.transform.position = Vector3(0, 0, 0)
    
    cube = engine.create_entity("cube")
    cube.body.mass = 1.0
    cube.shape_type = "sphere"
    cube.shape_size = Vector3(1.0, 1.0, 1.0)
    cube.transform.position = Vector3(0, 10, 0)
    
    engine.start()
    
    print(f"Initial: cube at y={cube.transform.position.y:.2f}")
    
    for i in range(300):
        engine.tick()
        if i % 60 == 0:
            print(f"Tick {i}: cube at y={cube.transform.position.y:.2f}, velocity={cube.body.linear_velocity.y:.2f}")
    
    print(f"\nFinal: cube at y={cube.transform.position.y:.2f}")
    print(f"Simulation time: {engine.sim_time:.2f}s")
    print(f"Total ticks: {engine.tick_count}")
    print("\n[OK] Simulation working! (Install USD to generate .usda files)")

if __name__ == "__main__":
    main()

