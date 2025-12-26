# Runbook

## Prerequisites

- Docker and Docker Compose
- CMake 3.15+ (for local C++ build)
- Node.js 20+ (for local gateway/visualizer)
- Python 3.11+ (for tools)
- gRPC and protobuf libraries (for local coordinator build)

## Build Steps

### Local C++ Build

```bash
cd sim-core
mkdir build && cd build
cmake ..
make -j$(nproc)
```

### Local Services

```bash
# Gateway
cd sim-services/gateway
npm install
npm start

# Visualizer
cd consumers/debug-visualizer
npm install
npm run dev
```

### Python Tools

```bash
cd tools/python
pip install -r requirements.txt

# Generate protobuf stubs
python -m grpc_tools.protoc -I../../sim-services/coordinator --python_out=. --grpc_python_out=. ../../sim-services/coordinator/sim.proto
```

## Run Steps

### Docker Compose

```bash
cd infra/docker
docker-compose up --build
```

Services:
- Coordinator: localhost:50051
- Gateway: localhost:3000
- Visualizer: http://localhost:5173

### Kubernetes

```bash
# Build and push images (adjust registry)
docker build -f infra/docker/Dockerfile.coordinator -t your-registry/navora/coordinator:latest .
docker build -f infra/docker/Dockerfile.gateway -t your-registry/navora/gateway:latest .
docker build -f infra/docker/Dockerfile.visualizer -t your-registry/navora/visualizer:latest .

# Deploy
kubectl apply -f infra/k8s/coordinator.yaml
kubectl apply -f infra/k8s/gateway.yaml
kubectl apply -f infra/k8s/visualizer.yaml

# Get service endpoints
kubectl get services
```

## Validation

### 1. Start Simulation

```bash
curl -X POST http://localhost:3000/api/sim/start
```

Expected: `{"success":true,"tick":0}`

### 2. Spawn Entity

```bash
curl -X POST http://localhost:3000/api/sim/spawn -H "Content-Type: application/json" -d '{"x":0,"y":5,"z":0,"mass":1.0,"radius":1.0}'
```

Expected: `{"success":true,"tick":0}`

### 3. Check Status

```bash
curl http://localhost:3000/api/sim/status
```

Expected: `{"running":true,"currentTick":N,"simTime":T,"consumerCount":0}`

### 4. Visualizer

Open http://localhost:5173. Should see:
- Grid floor
- Green wireframe sphere falling
- Tick counter updating

### 5. Python Controller

```bash
cd tools/python/controllers
python controller.py
```

Expected: Spawns entity, streams 10 state updates, prints tick counts.

## Physics Explosion Scenario

1. Spawn multiple entities close together:
```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/sim/spawn -H "Content-Type: application/json" -d "{\"x\":$((i*2-6)),\"y\":10,\"z\":0,\"mass\":1.0,\"radius\":1.0}"
done
```

2. Watch visualizer: entities should collide and scatter

3. Apply forces:
```bash
curl -X POST http://localhost:3000/api/sim/apply-impulse -H "Content-Type: application/json" -d '{"entityId":"entity_0001","x":10,"y":0,"z":0}'
```

4. Debug via visualizer: observe motion, check tick progression

## Troubleshooting

- Coordinator not starting: Check gRPC port 50051 not in use
- Visualizer can't connect: Verify COORDINATOR_ADDR env var
- No entities visible: Check simulation is running, entities spawned
- Ticks not advancing: Check coordinator logs for errors

