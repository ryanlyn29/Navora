# Omniverse Integration Summary

## Changes Implemented

### 1. OpenUSD as Authoritative Scene Representation

**Files Modified:**
- `sim-core/scene/usd_scene.h` (new)
- `sim-core/scene/usd_scene.cpp` (new)
- `sim-core/simulator.h` - Updated to use `USDScene` instead of `SceneGraph`
- `sim-core/simulator.cpp` - Updated tick loop to read/write from USD
- `sim-services/coordinator/coordinator.cpp` - Updated to use USDScene API

**Key Changes:**
- Replaced custom `SceneGraph` with `USDScene` wrapping `pxr::UsdStage`
- Entity IDs map to USD prim paths: `/World/Entities/{id}`
- Physics state stored in USD attributes via standard schemas
- Simulation updates USD prims directly each tick

### 2. UsdPhysics Schemas Applied

**Schemas Used:**
- `UsdGeomXform` - Transforms
- `UsdGeomSphere` - Sphere collision shapes
- `UsdGeomMesh` - Plane collision shapes
- `UsdPhysicsRigidBodyAPI` - Linear/angular velocity
- `UsdPhysicsMassAPI` - Mass properties
- `UsdPhysicsCollisionAPI` - Collision properties

**Implementation:**
- `USDScene::apply_physics_schema()` applies schemas on entity creation/update
- `USDScene::get_entity()` reads physics state from USD attributes

### 3. Omniverse Live Sync Connector

**Files Created:**
- `consumers/omniverse-connector/connector.cpp`
- `consumers/omniverse-connector/CMakeLists.txt`
- `consumers/omniverse-connector/README.md`

**Behavior:**
- Connects to coordinator via gRPC `StreamState`
- Opens USD stage on Nucleus: `omniverse://localhost/Users/navora/navora_live.usd`
- Mirrors entity updates (created/updated/removed) to Nucleus prims
- Saves stage after each update batch
- Never modifies simulation state (read-only observer)

### 4. USD File Export

**Files Created:**
- `sim-core/usd/usd_file_export.h`
- `sim-core/usd/usd_file_export.cpp`

**Features:**
- Export to `.usda` (ASCII) or `.usdc` (binary) formats
- Export entire scene state for replay/analysis
- Can be opened in Omniverse Composer or Isaac Sim

### 5. Build System Updates

**Files Modified:**
- `sim-core/CMakeLists.txt` - Added USD dependency
- `consumers/omniverse-connector/CMakeLists.txt` - New build target

**Dependencies:**
- `sim-core`: Requires OpenUSD (required)
- `omniverse-connector`: Requires OpenUSD + Omniverse Client Library (optional)

### 6. Documentation

**Files Created/Updated:**
- `docs/omniverse-integration.md` - Integration guide
- `docs/BUILD.md` - Build instructions
- `docs/architecture.md` - Updated scene graph section
- `README.md` - Added Omniverse integration section
- `consumers/omniverse-connector/README.md` - Connector usage

## Architecture Compliance

✅ **Navora is authoritative**: Simulation state lives in Navora's UsdStage
✅ **Omniverse is observer**: Connector never computes physics or controls time
✅ **One-way flow**: Navora → Omniverse (state updates only)
✅ **Optional integration**: Navora runs without Omniverse (connector is separate)
✅ **Determinism preserved**: Omniverse connectivity does not affect simulation

## Testing Requirements

### Without Omniverse

1. Build and run coordinator (requires USD):
   ```bash
   cd sim-services/coordinator
   mkdir build && cd build
   cmake .. -DUSD_ROOT=/path/to/usd
   make
   ./coordinator
   ```

2. Verify simulation runs normally
3. Verify web visualizer connects
4. Verify state deltas stream correctly

### With Omniverse

1. Start Nucleus server
2. Build omniverse-connector:
   ```bash
   cd consumers/omniverse-connector
   mkdir build && cd build
   cmake .. -DUSD_ROOT=/path/to/usd
   make
   ```

3. Start coordinator
4. Start connector:
   ```bash
   ./omniverse_connector localhost:50051 omniverse://localhost/Users/navora/navora_live.usd
   ```

5. Open stage in Omniverse Composer/Isaac Sim
6. Verify prims update in real time
7. Disconnect connector, verify simulation continues

## Known Limitations

- USD installation required for sim-core (not optional per requirements)
- Omniverse Client Library required for connector (Nucleus access)
- Docker images need USD installation (not yet updated)
- USD find_package may need custom FindUSD.cmake if not in standard location

## Next Steps

1. Update Dockerfiles to include USD installation
2. Add FindUSD.cmake if needed for cross-platform builds
3. Test with actual Nucleus server
4. Verify determinism with/without connector running

