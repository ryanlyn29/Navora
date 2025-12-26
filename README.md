# Navora

Headless physics simulation system with USD-first, viewer-agnostic architecture. Generates time-sampled USD files for visualization in Blender and Omniverse-compatible tools.

## Architecture

Navora follows a **headless simulation → USD authoring → external viewer** pipeline:

```
┌─────────────────┐
│  Python Sim     │
│  (Headless)     │
│  - Physics      │
│  - Time steps   │
└────────┬────────┘
         │
         │ Writes time-sampled USD
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Blender│ │Omniverse │
│ Viewer │ │  Tools   │
└────────┘ └──────────┘
```

### Core Principles

1. **Simulation is headless**: No rendering, no GPU dependencies
2. **USD is authoritative**: All scene data written to USD files
3. **Viewer-agnostic**: Blender, Omniverse, or any USD-capable tool can open outputs
4. **Time-sampled**: Transforms are keyframed for timeline scrubbing

### Why Decouple Rendering?

- **Hardware independence**: Works on AMD GPUs, no CUDA/RTX required
- **Flexibility**: Use any USD viewer (Blender, Omniverse, Houdini, etc.)
- **Reproducibility**: USD files are deterministic and portable
- **Performance**: Simulation runs independently of visualization

### Blender as Viewer

Blender serves as a viewer only:
- **Import USD files** (File → Import → Universal Scene Description)
- Inspect geometry and hierarchy
- Scrub timeline to view animation
- No rendering logic in simulation
- Rendering intentionally decoupled
- **Not used as an editor** - simulation is authoritative

### Omniverse Compatibility

Outputs remain Omniverse-compatible:
- Standard USD schemas (UsdGeom, UsdPhysics)
- Z-up coordinate system (USD and Blender standard)
- Time-sampled transforms
- Proper stage metadata

## Quick Start

### Installation

```bash
pip install -r requirements.txt
pip install usd-core
```

### Run Example

```bash
python examples/moving_cube.py
```

Generates `output/moving_cube.usda` - a 5-second animation of a cube falling under gravity.

### View in Blender

1. Install Blender 4.0 or later
2. Open Blender
3. **File → Import → Universal Scene Description (.usd/.usda)**
4. Select `output/moving_cube.usda`
5. Press **Home** to frame the scene
6. Scrub timeline to view animation

**Expected Result:**
- Horizontal gray plane (ground)
- Blue sphere floating above the plane
- Sphere falls when scrubbing timeline
- No manual rotation or repositioning required

**Note:** The USD world is pre-rotated +90° around X for Blender compatibility. Blender is used strictly as a viewer - import preserves hierarchy and animation for timeline scrubbing.

### Debug UI

```bash
cd frontend/debug_ui
python app.py
```

Open http://localhost:5000 for browser-based controls:
- Start/stop simulation
- Spawn entities
- Inspect scene metadata
- Export USD files

## Project Structure

```
navora/
├── sim/              # Simulation engine
│   ├── engine.py     # Main simulation loop
│   ├── physics.py    # Physics rules (gravity, collisions)
│   └── entities.py   # Scene objects and state
├── usd/              # USD authoring
│   ├── stage.py      # Stage setup (Z-up, units)
│   ├── writer.py     # Time-sampled USD writing
│   └── schemas.py    # UsdGeom/UsdPhysics helpers
├── frontend/
│   └── debug_ui/     # Browser controls (no rendering)
├── examples/
│   └── moving_cube.py  # Minimal demo
└── requirements.txt
```

## USD Requirements

- **Z-up coordinate system**: Standard for USD and Blender
- **metersPerUnit = 1.0**: Standard unit scale
- **Time-sampled transforms**: Enables timeline scrubbing
- **Standard schemas**: UsdGeom, UsdPhysics for compatibility

## Installing OpenUSD

Install via pip:

```bash
pip install usd-core
```

No source build required. Blender's bundled USD can be used as fallback, but pip installation is recommended.

## Viewing in Blender

### Workflow

1. Generate USD file: `python examples/moving_cube.py`
2. Open Blender 4.0+
3. **File → Import → Universal Scene Description (.usd/.usda)** → select `.usda` file
4. Press **Home** to frame the scene
5. Scrub timeline to view animation

### What Success Looks Like

- Objects visible in viewport (floor plane, falling cube)
- Animation plays when scrubbing timeline
- Outliner shows `/World` hierarchy with entities
- Timeline shows correct frame range (0-300 for 5s at 60fps)

### Important Notes

- Use **File → Import → Universal Scene Description** to import USD files
- Import preserves hierarchy and animation for timeline scrubbing
- The USD world is pre-rotated +90° around X for Blender compatibility
- Blender is viewer only - simulation runs independently
- No manual rotation or repositioning required

## Development

### Creating a Simulation

```python
from sim.engine import SimulationEngine
from sim.entities import Entity, Vector3
from usd.writer import USDWriter

engine = SimulationEngine()

# Create entities
floor = engine.create_entity("floor")
floor.body.is_static = True
floor.shape_type = "plane"

cube = engine.create_entity("cube")
cube.transform.position = Vector3(0, 0, 10)

# Run simulation
engine.start()
for frame in range(300):
    engine.tick()

# Write USD
writer = USDWriter("output.usda")
for frame in range(300):
    time = frame / 60.0
    writer.write_frame(engine.get_all_entities(), time)
writer.save()
```

## Non-Goals

This project explicitly does **NOT** include:
- Isaac Sim integration
- Omniverse RTX rendering
- CUDA acceleration
- Browser-based rendering
- Building OpenUSD from source (use `pip install usd-core`)

## Dependencies

- `usd-core`: OpenUSD Python API (install via pip)
- `flask`: Debug UI server
- `flask-cors`: CORS support

## License

[Your License Here]
