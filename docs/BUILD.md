# Build Instructions

## Prerequisites

- C++17 compiler
- CMake 3.15+
- OpenUSD libraries
- gRPC and Protobuf
- Node.js (for gateway and visualizer)

## USD Setup

OpenUSD must be installed and discoverable by CMake. Set `USD_ROOT` or ensure `find_package(USD)` succeeds.

Example:
```bash
export USD_ROOT=/path/to/usd
```

## Building sim-core

```bash
cd sim-core
mkdir build && cd build
cmake ..
make
```

## Building coordinator

```bash
cd sim-services/coordinator
mkdir build && cd build
cmake ..
make
```

## Building omniverse-connector (optional)

```bash
cd consumers/omniverse-connector
mkdir build && cd build
cmake ..
make
```

Requires:
- OpenUSD
- gRPC
- Omniverse Client Library (for Nucleus access)

## Docker Build

All services can be built via Docker:

```bash
cd infra/docker
docker-compose build
```

Note: Docker images require USD to be installed in the container. Update Dockerfiles to include USD installation.

