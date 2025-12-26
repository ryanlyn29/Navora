# Viewing Navora Simulation in Blender

## Installation

Install OpenUSD via pip:

```bash
pip install usd-core
```

No source build required. Blender's bundled USD can be used as fallback, but pip installation is recommended.

## Generate USD File

Run the simulation script:

```bash
python examples/moving_cube.py
```

This creates `output/moving_cube.usda` - a 5-second animation of a cube falling under gravity.

## Import into Blender

1. **Open Blender 4.0 or later**
   - Must be Blender 4.0+ (has USD support)

2. **File → Import → Universal Scene Description (.usd/.usda)**
   - Navigate to: `output/moving_cube.usda`
   - Select the file and click **Import USD**

3. **Important**: Use **File → Import**, not Open
   - **Import** preserves USD hierarchy and animation for timeline scrubbing
   - Import is the correct workflow for viewing USD files in Blender
   - The USD world is pre-rotated +90° around X for Blender compatibility

4. **View the Animation**
   - Press **Home** to frame the scene
   - Objects load: horizontal floor plane and falling sphere
   - **Scrub the timeline** (bottom of Blender window) to see animation
   - Press **Spacebar** to play animation
   - No manual rotation or repositioning required

## What Success Looks Like

- **Horizontal gray plane** (ground) visible in viewport
- **Blue sphere** floating above the plane
- Sphere falls when scrubbing timeline
- Animation plays smoothly
- Outliner shows `/World` hierarchy with entities
- Timeline shows correct frame range (0-300 for 5s at 60fps)
- **No manual transforms required** - scene is pre-oriented for Blender

## Blender as Viewer

Blender serves as a viewer only:
- **Import USD files** (File → Import → Universal Scene Description)
- Inspect geometry and hierarchy
- Scrub timeline to view animation
- No rendering logic in simulation
- Rendering intentionally decoupled
- **Not used as an editor** - simulation is authoritative
- World is pre-rotated for correct orientation in Blender

## Viewport Navigation

- **Numpad 0**: View from camera
- **Numpad 7**: Top view
- **Numpad 1**: Front view
- **Home**: Frame all objects
- **Middle mouse drag**: Rotate view
- **Scroll wheel**: Zoom

## Troubleshooting

### "No module named 'pxr'"
- USD is not installed. Run: `pip install usd-core`

### Blender can't open USD files
- Ensure Blender 4.0 or later
- Check USD addon is enabled: Edit > Preferences > Add-ons > Search "USD"

### Nothing appears in viewport
- Check viewport shading (top right, switch to Material Preview or Solid)
- Press **Home** to frame all objects
- Check Outliner (top right) for `/World` hierarchy

### Timeline doesn't show animation
- Ensure you used **File → Import → Universal Scene Description**, not Open
- Check timeline frame range matches simulation (0-300 for 5s at 60fps)
- Verify time-sampled transforms are present in USD file
- Try scrubbing the timeline manually (drag the playhead)

## Quick Test (Without USD)

To verify simulation works without USD:

```bash
python test_sim_only.py
```

This shows the cube falling (text output only).
