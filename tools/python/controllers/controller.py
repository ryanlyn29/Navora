import grpc
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../sim-services/coordinator'))
import sim_pb2
import sim_pb2_grpc

COORDINATOR_ADDR = os.getenv('COORDINATOR_ADDR', 'localhost:50051')

class Controller:
    def __init__(self, addr=COORDINATOR_ADDR):
        self.channel = grpc.insecure_channel(addr)
        self.stub = sim_pb2_grpc.SimulationCoordinatorStub(self.channel)

    def start_sim(self):
        cmd = sim_pb2.Command(type=sim_pb2.Command.CommandType.RESET_SIM)
        resp = self.stub.StartSimulation(cmd)
        return resp.success

    def stop_sim(self):
        cmd = sim_pb2.Command(type=sim_pb2.Command.CommandType.RESET_SIM)
        resp = self.stub.StopSimulation(cmd)
        return resp.success

    def spawn_entity(self, x=0, y=5, z=0, mass=1.0, radius=1.0):
        cmd = sim_pb2.Command(
            type=sim_pb2.Command.CommandType.SPAWN_ENTITY,
            position=sim_pb2.Vector3(x=x, y=y, z=z),
            mass=mass,
            shape=sim_pb2.CollisionShape(
                type=sim_pb2.CollisionShape.ShapeType.SPHERE,
                size=sim_pb2.Vector3(x=radius, y=radius, z=radius)
            )
        )
        resp = self.stub.SendCommand(cmd)
        return resp.success

    def apply_force(self, entity_id, x=0, y=0, z=0):
        cmd = sim_pb2.Command(
            type=sim_pb2.Command.CommandType.APPLY_FORCE,
            entity_id=entity_id,
            force=sim_pb2.Vector3(x=x, y=y, z=z)
        )
        resp = self.stub.SendCommand(cmd)
        return resp.success

    def apply_impulse(self, entity_id, x=0, y=0, z=0):
        cmd = sim_pb2.Command(
            type=sim_pb2.Command.CommandType.APPLY_IMPULSE,
            entity_id=entity_id,
            force=sim_pb2.Vector3(x=x, y=y, z=z)
        )
        resp = self.stub.SendCommand(cmd)
        return resp.success

    def stream_state(self, callback):
        request = sim_pb2.StreamRequest(consumer_id="python_controller")
        for delta in self.stub.StreamState(request):
            callback(delta)

if __name__ == '__main__':
    ctrl = Controller()
    print("Starting simulation...")
    ctrl.start_sim()
    
    print("Spawning entity...")
    ctrl.spawn_entity(0, 10, 0, 1.0, 1.0)
    
    print("Streaming state (10 updates)...")
    count = 0
    def on_delta(delta):
        nonlocal count
        count += 1
        if count <= 10:
            print(f"Tick {delta.metadata.tick}: {len(delta.updated)} entities")
        if count >= 10:
            return True
        return False
    
    try:
        for delta in ctrl.stub.StreamState(sim_pb2.StreamRequest(consumer_id="test")):
            on_delta(delta)
            if count >= 10:
                break
    except KeyboardInterrupt:
        pass

