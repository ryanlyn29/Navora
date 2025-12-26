import express from 'express';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = './sim.proto';
const COORDINATOR_ADDR = process.env.COORDINATOR_ADDR || 'coordinator:50051';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).navora.sim;
const client = new proto.SimulationCoordinator(COORDINATOR_ADDR, grpc.credentials.createInsecure());

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.post('/api/sim/start', (req, res) => {
  const cmd = { type: 0 };
  client.StartSimulation(cmd, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: response.success, tick: response.tick, error: response.error });
    }
  });
});

app.post('/api/sim/stop', (req, res) => {
  const cmd = { type: 0 };
  client.StopSimulation(cmd, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: response.success, tick: response.tick, error: response.error });
    }
  });
});

app.get('/api/sim/status', (req, res) => {
  const cmd = {};
  client.GetStatus(cmd, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({
        running: response.running || false,
        currentTick: response.currentTick || response.current_tick || 0,
        simTime: response.simTime || response.sim_time || 0,
        consumerCount: response.consumerCount || response.consumer_count || 0
      });
    }
  });
});

app.post('/api/sim/spawn', (req, res) => {
  const { x = 0, y = 5, z = 0, mass = 1.0, radius = 1.0 } = req.body;
  const cmd = {
    type: 2,
    position: { x, y, z },
    mass,
    shape: {
      type: 0,
      size: { x: radius, y: radius, z: radius }
    }
  };
  client.SendCommand(cmd, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: response.success, tick: response.tick, error: response.error });
    }
  });
});

app.post('/api/sim/apply-force', (req, res) => {
  const { entityId, x = 0, y = 0, z = 0 } = req.body;
  if (!entityId) {
    return res.status(400).json({ error: 'entityId required' });
  }
  const cmd = {
    type: 0,
    entityId,
    force: { x, y, z }
  };
  client.SendCommand(cmd, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: response.success, tick: response.tick, error: response.error });
    }
  });
});

app.post('/api/sim/apply-impulse', (req, res) => {
  const { entityId, x = 0, y = 0, z = 0 } = req.body;
  if (!entityId) {
    return res.status(400).json({ error: 'entityId required' });
  }
  const cmd = {
    type: 1,
    entityId,
    force: { x, y, z }
  };
  client.SendCommand(cmd, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: response.success, tick: response.tick, error: response.error });
    }
  });
});

app.post('/api/sim/reset', (req, res) => {
  const cmd = { type: 4 };
  client.SendCommand(cmd, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: response.success, tick: response.tick, error: response.error });
    }
  });
});

app.get('/api/sim/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let isClosed = false;
  const safeEnd = () => {
    if (!isClosed) {
      isClosed = true;
      try {
        res.end();
      } catch (err) {
        console.error('Error ending stream response:', err);
      }
    }
  };

  const safeWrite = (data) => {
    if (isClosed) return false;
    try {
      return res.write(data);
    } catch (err) {
      console.error('Error writing to stream:', err);
      safeEnd();
      return false;
    }
  };

  const validateNumber = (value, defaultValue = 0) => {
    if (typeof value === 'number' && isFinite(value)) return value;
    const parsed = parseFloat(value);
    return (isNaN(parsed) || !isFinite(parsed)) ? defaultValue : parsed;
  };

  const request = { consumerId: 'http_stream_' + Date.now(), startTick: 0 };
  let stream;
  
  try {
    stream = client.StreamState(request);
  } catch (err) {
    console.error('Failed to create stream:', err);
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to create stream' })}\n\n`);
    safeEnd();
    return;
  }

  stream.on('data', (delta) => {
    if (isClosed) return;
    
    if (!delta || typeof delta !== 'object') {
      console.warn('Received invalid delta object');
      return;
    }

    const metadata = delta.metadata || {};
    const safeDelta = {
      metadata: {
        tick: validateNumber(metadata.tick, 0),
        simTime: validateNumber(metadata.simTime || metadata.sim_time, 0),
        deltaTime: validateNumber(metadata.deltaTime || metadata.delta_time, 0)
      },
      created: Array.isArray(delta.created) ? delta.created.map(e => {
        if (!e || !e.id) return null;
        return {
          id: String(e.id),
          transform: {
            position: {
              x: validateNumber(e.transform?.position?.x, 0),
              y: validateNumber(e.transform?.position?.y, 0),
              z: validateNumber(e.transform?.position?.z, 0)
            },
            rotation: {
              x: validateNumber(e.transform?.rotation?.x, 0),
              y: validateNumber(e.transform?.rotation?.y, 0),
              z: validateNumber(e.transform?.rotation?.z, 0),
              w: validateNumber(e.transform?.rotation?.w, 1)
            }
          },
          shape: e.shape ? {
            type: validateNumber(e.shape.type, 0),
            size: {
              x: validateNumber(e.shape.size?.x, 1),
              y: validateNumber(e.shape.size?.y, 1),
              z: validateNumber(e.shape.size?.z, 1)
            }
          } : { type: 0, size: { x: 1, y: 1, z: 1 } },
          physics: e.physics ? {
            linearVelocity: {
              x: validateNumber(e.physics.linearVelocity?.x || e.physics.linear_velocity?.x, 0),
              y: validateNumber(e.physics.linearVelocity?.y || e.physics.linear_velocity?.y, 0),
              z: validateNumber(e.physics.linearVelocity?.z || e.physics.linear_velocity?.z, 0)
            }
          } : null
        };
      }).filter(e => e !== null) : [],
      removed: Array.isArray(delta.removed) ? delta.removed.filter(id => id != null).map(id => String(id)) : [],
      updated: Array.isArray(delta.updated) ? delta.updated.map(e => {
        if (!e || !e.id) return null;
        return {
          id: String(e.id),
          transform: {
            position: {
              x: validateNumber(e.transform?.position?.x, 0),
              y: validateNumber(e.transform?.position?.y, 0),
              z: validateNumber(e.transform?.position?.z, 0)
            },
            rotation: {
              x: validateNumber(e.transform?.rotation?.x, 0),
              y: validateNumber(e.transform?.rotation?.y, 0),
              z: validateNumber(e.transform?.rotation?.z, 0),
              w: validateNumber(e.transform?.rotation?.w, 1)
            }
          },
          shape: e.shape ? {
            type: validateNumber(e.shape.type, 0),
            size: {
              x: validateNumber(e.shape.size?.x, 1),
              y: validateNumber(e.shape.size?.y, 1),
              z: validateNumber(e.shape.size?.z, 1)
            }
          } : { type: 0, size: { x: 1, y: 1, z: 1 } },
          physics: e.physics ? {
            linearVelocity: {
              x: validateNumber(e.physics.linearVelocity?.x || e.physics.linear_velocity?.x, 0),
              y: validateNumber(e.physics.linearVelocity?.y || e.physics.linear_velocity?.y, 0),
              z: validateNumber(e.physics.linearVelocity?.z || e.physics.linear_velocity?.z, 0)
            }
          } : null
        };
      }).filter(e => e !== null) : []
    };

    try {
      const jsonStr = JSON.stringify(safeDelta);
      if (!safeWrite(`data: ${jsonStr}\n\n`)) {
        return;
      }
    } catch (err) {
      console.error('Error serializing delta:', err);
      return;
    }
  });

  stream.on('error', (err) => {
    console.error('Stream error:', err);
    if (!isClosed) {
      const errorMsg = err && err.message ? err.message : 'Unknown stream error';
      safeWrite(`event: error\ndata: ${JSON.stringify({ error: errorMsg })}\n\n`);
      safeEnd();
    }
  });

  stream.on('end', () => {
    if (!isClosed) {
      safeWrite(`event: end\ndata: ${JSON.stringify({ message: 'Stream ended' })}\n\n`);
      safeEnd();
    }
  });

  req.on('close', () => {
    isClosed = true;
    try {
      if (stream && stream.cancel) {
        stream.cancel();
      }
    } catch (err) {
      console.error('Error canceling stream:', err);
    }
    safeEnd();
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
    isClosed = true;
    try {
      if (stream && stream.cancel) {
        stream.cancel();
      }
    } catch (cancelErr) {
      console.error('Error canceling stream on request error:', cancelErr);
    }
    safeEnd();
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway server listening on port ${PORT}`);
});

