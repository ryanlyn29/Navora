import requests
import time
import sys

GATEWAY_URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:3000'

def start_sim():
    resp = requests.post(f'{GATEWAY_URL}/api/sim/start')
    return resp.json()

def spawn_entity(x=0, y=5, z=0, mass=1.0, radius=1.0):
    resp = requests.post(f'{GATEWAY_URL}/api/sim/spawn', json={
        'x': x, 'y': y, 'z': z, 'mass': mass, 'radius': radius
    })
    return resp.json()

def get_status():
    resp = requests.get(f'{GATEWAY_URL}/api/sim/status')
    return resp.json()

if __name__ == '__main__':
    print("Starting simulation...")
    result = start_sim()
    print(f"Start result: {result}")
    
    print("Spawning entities...")
    for i in range(3):
        result = spawn_entity(0, 5 + i * 2, 0, 1.0, 0.5)
        print(f"Spawned: {result}")
        time.sleep(0.1)
    
    print("Status:")
    print(get_status())

