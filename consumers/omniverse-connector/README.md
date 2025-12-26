# Omniverse Connector

Streams Navora simulation state to NVIDIA Omniverse Nucleus via Live Sync.

## Requirements

- NVIDIA Omniverse Nucleus server running
- OpenUSD libraries
- gRPC client libraries
- Coordinator service accessible

## Build

```bash
mkdir build && cd build
cmake ..
make
```

## Usage

```bash
./omniverse_connector [coordinator_address] [nucleus_url]
```

Arguments:
- `coordinator_address`: gRPC address (default: `localhost:50051`)
- `nucleus_url`: Omniverse Nucleus URL (default: `omniverse://localhost/Users/navora/navora_live.usd`)

## Behavior

- Connects to coordinator via gRPC `StreamState`
- Opens USD stage on Nucleus
- Mirrors entity updates to Nucleus prims
- Saves stage after each update batch
- Never modifies simulation state

## Example

```bash
./omniverse_connector localhost:50051 omniverse://localhost/Users/navora/navora_live.usd
```

Then open `omniverse://localhost/Users/navora/navora_live.usd` in Omniverse Composer or Isaac Sim to view live simulation.

