# Omniverse Integration

## Architecture

Navora uses OpenUSD (pxr::Usd) as the authoritative scene representation. Omniverse serves as an optional visualization and inspection tool.

```
┌─────────────────┐
│   Navora Core   │
│  (Authoritative)│
│                 │
│  UsdStage       │
│  Physics        │
│  Deterministic  │
└────────┬────────┘
         │
         │ gRPC State Deltas
         │
    ┌────┴────┐
    │        │
    ▼        ▼
┌────────┐ ┌──────────────────┐
│Gateway │ │Omniverse Connector│
│(REST)  │ │  (Live Sync)      │
└────────┘ └──────────────────┘
    │              │
    │              │ USD Updates
    │              │
    ▼              ▼
┌────────┐ ┌──────────────────┐
│Web     │ │  Nucleus Server   │
│Viz     │ │  (Omniverse)      │
└────────┘ └──────────────────┘
```

## Core Principles

1. **Navora is authoritative**: Simulation state lives in Navora's UsdStage
2. **Omniverse is observer**: Never computes physics or controls time
3. **One-way flow**: Navora → Omniverse (state updates only)
4. **Optional integration**: Navora runs without Omniverse

## USD Scene Structure

```
/World
  /Entities
    /floor
      /Shape (Mesh for plane)
    /sphere_0
      /Shape (Sphere)
    /sphere_1
      /Shape (Sphere)
```

All entities use:
- `UsdGeomXform` for transforms
- `UsdPhysicsRigidBodyAPI` for velocity
- `UsdPhysicsMassAPI` for mass
- `UsdPhysicsCollisionAPI` for collision properties
- `UsdGeomSphere` or `UsdGeomMesh` for shapes

## Omniverse Connector

The connector (`consumers/omniverse-connector/`) streams state deltas from the coordinator to a Nucleus server.

### Usage

```bash
./omniverse_connector [coordinator_address] [nucleus_url]
```

Default:
- Coordinator: `localhost:50051`
- Nucleus: `omniverse://localhost/Users/navora/navora_live.usd`

### Behavior

- Connects to coordinator via gRPC
- Opens USD stage on Nucleus
- Mirrors entity updates to Nucleus prims
- Saves stage after each update batch
- Never modifies simulation state

## USD Export

Export simulation state to USD files for replay:

```cpp
#include "usd/usd_file_export.h"

navora::usd::USDFileExporter exporter;
exporter.export_to_file(scene, "output.usda");
```

Supports `.usda` (ASCII) and `.usdc` (binary) formats.

## Running Without Omniverse

Navora runs normally without Omniverse:

1. Coordinator starts simulation
2. Gateway serves REST API
3. Web visualizer connects via SSE
4. No Omniverse dependency

## Running With Omniverse

1. Start Nucleus server
2. Start coordinator: `./coordinator`
3. Start gateway: `node gateway.js`
4. Start connector: `./omniverse_connector localhost:50051 omniverse://localhost/Users/navora/navora_live.usd`
5. Open stage in Omniverse Composer/Isaac Sim

## Determinism

Omniverse connectivity does not affect simulation determinism:
- Physics computed in Navora only
- USD updates are writes, not reads
- No feedback from Omniverse to simulation

