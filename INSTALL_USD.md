# Installing OpenUSD for Windows

The `usd-core` package may not be available via pip on Windows. Here are installation options:

## Option 1: Use Blender's Built-in USD Support

Blender 4.x includes USD support. You can:
1. Install Blender 4.x
2. Use Blender's Python environment which includes USD libraries
3. Run scripts using Blender's Python: `blender --python examples/moving_cube.py`

## Option 2: Install USD from NVIDIA

1. Download USD from: https://github.com/PixarAnimationStudios/USD/releases
2. Or use NVIDIA's pre-built binaries: https://developer.nvidia.com/usd
3. Add USD to PYTHONPATH

## Option 3: Use Conda (Recommended for Windows)

```bash
conda install -c conda-forge usd-core
```

## Option 4: Docker (Alternative)

Use a Linux container with USD pre-installed.

## Quick Test Without USD

To test the simulation logic without USD:

```python
# test_sim.py
from sim.engine import SimulationEngine
from sim.entities import Entity, Vector3

engine = SimulationEngine()

floor = engine.create_entity("floor")
floor.body.is_static = True
floor.shape_type = "plane"
floor.transform.position = Vector3(0, 0, 0)

cube = engine.create_entity("cube")
cube.body.mass = 1.0
cube.shape_type = "sphere"
cube.transform.position = Vector3(0, 10, 0)

engine.start()
for i in range(300):
    engine.tick()
    if i % 60 == 0:
        print(f"Tick {i}: cube at ({cube.transform.position.x:.2f}, {cube.transform.position.y:.2f}, {cube.transform.position.z:.2f})")

print(f"Final position: {cube.transform.position.y:.2f}")
```

