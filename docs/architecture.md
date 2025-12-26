# Architecture

## Overview

Navora is a deterministic physics simulation system with USD-inspired scene representation, designed for distributed deployment and multi-consumer state streaming.

## Service Boundaries

### sim-core (C++)
Authoritative simulation engine. Runs deterministic physics ticks at fixed timestep (60Hz). Contains:
- Physics: rigid body dynamics, collision detection/resolution
- Scene graph: entity hierarchy with parent/child relationships
- USD export: minimal USD schema serialization

### coordinator (gRPC)
Manages simulation lifecycle and state streaming:
- Starts/stops simulation instances
- Tracks connected consumers
- Streams state deltas via gRPC
- Accepts commands (spawn, apply force, etc.)

### gateway (REST)
External API layer:
- REST endpoints for control
- Proxies to coordinator via gRPC
- Minimal; gRPC is primary for internal communication

### debug-visualizer (WebGL)
Instrumentation client:
- Connects to coordinator gRPC stream
- Renders wireframe scene
- Read-only; cannot mutate simulation

## Data Flow

```
[Python Controller] --> [gRPC] --> [Coordinator] <-- [gRPC Stream] <-- [Visualizer]
                              |
                              v
                         [sim-core]
                              |
                              v
                    [State Deltas]
```

1. Controller sends commands via gRPC to coordinator
2. Coordinator updates sim-core state
3. Coordinator streams state deltas to all connected consumers
4. Visualizer renders wireframes from stream

## Determinism Guarantees

- Fixed timestep (1/60s)
- Deterministic iteration order (entity list order)
- Deterministic integrator (semi-implicit Euler)
- No random number generation in simulation loop
- Deterministic collision resolution order

What breaks determinism:
- Non-deterministic iteration (unordered_map iteration order)
- Floating point precision differences across platforms
- External timing dependencies

## Scene Graph

OpenUSD (pxr::Usd) is the authoritative scene representation:
- `UsdStage` in memory for all entities
- Entity IDs map to USD prim paths: `/World/Entities/{id}`
- Standard USD schemas: `UsdGeomXform`, `UsdGeomSphere`, `UsdGeomMesh`
- Physics schemas: `UsdPhysicsRigidBodyAPI`, `UsdPhysicsMassAPI`, `UsdPhysicsCollisionAPI`
- Transform hierarchy via USD parent/child relationships

## USD Integration

- Simulation updates USD prims directly each tick
- Physics state stored in USD attributes
- USD export available for replay/analysis
- Omniverse connector mirrors state to Nucleus (optional)

## Language Choices

- C++: Performance-critical simulation core, deterministic execution
- Python: Control scripts, orchestration, testing
- TypeScript/Node: Gateway REST API, web visualizer
- gRPC: High-performance internal communication
- REST: External API for simple integration

