from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from sim.engine import SimulationEngine
from usd.writer import USDWriter

app = Flask(__name__)
CORS(app)

engine = SimulationEngine()
output_dir = "output"
os.makedirs(output_dir, exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        'running': engine.running,
        'tick': engine.tick_count,
        'simTime': engine.sim_time,
        'fixedDt': engine.get_fixed_dt(),
        'entityCount': len(engine.entities)
    })


@app.route('/api/entities', methods=['GET'])
def get_entities():
    entities_data = []
    for entity in engine.get_all_entities():
        entities_data.append({
            'id': entity.id,
            'position': {
                'x': entity.transform.position.x,
                'y': entity.transform.position.y,
                'z': entity.transform.position.z
            },
            'velocity': {
                'x': entity.body.linear_velocity.x,
                'y': entity.body.linear_velocity.y,
                'z': entity.body.linear_velocity.z
            },
            'mass': entity.body.mass,
            'isStatic': entity.body.is_static,
            'shapeType': entity.shape_type
        })
    return jsonify(entities_data)


@app.route('/api/start', methods=['POST'])
def start_simulation():
    engine.start()
    return jsonify({'success': True, 'message': 'Simulation started'})


@app.route('/api/stop', methods=['POST'])
def stop_simulation():
    engine.stop()
    return jsonify({'success': True, 'message': 'Simulation stopped'})


@app.route('/api/reset', methods=['POST'])
def reset_simulation():
    engine.reset()
    return jsonify({'success': True, 'message': 'Simulation reset'})


@app.route('/api/tick', methods=['POST'])
def tick_simulation():
    engine.tick()
    return jsonify({
        'success': True,
        'tick': engine.tick_count,
        'simTime': engine.sim_time
    })


@app.route('/api/spawn', methods=['POST'])
def spawn_entity():
    data = request.json
    entity_id = data.get('id', f'entity_{len(engine.entities)}')
    x = data.get('x', 0)
    y = data.get('y', 0)
    z = data.get('z', 5)
    mass = data.get('mass', 1.0)
    shape_type = data.get('shapeType', 'sphere')
    
    entity = engine.create_entity(entity_id)
    entity.transform.position.x = x
    entity.transform.position.y = y
    entity.transform.position.z = z
    entity.body.mass = mass
    entity.shape_type = shape_type
    
    return jsonify({'success': True, 'entityId': entity_id})


@app.route('/api/export', methods=['POST'])
def export_usd():
    data = request.json
    filename = data.get('filename', 'simulation.usda')
    duration = data.get('duration', 5.0)
    fps = data.get('fps', 60)
    
    filepath = os.path.join(output_dir, filename)
    writer = USDWriter(filepath)
    
    engine.start()
    total_frames = int(duration * fps)
    
    for frame in range(total_frames):
        time = frame / fps
        engine.tick()
        if frame % 1 == 0:
            writer.write_frame(engine.get_all_entities(), time)
    
    writer.save()
    engine.stop()
    
    return jsonify({
        'success': True,
        'filepath': filepath,
        'frames': total_frames,
        'duration': duration
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)

