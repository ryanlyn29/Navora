from typing import List, Dict, Optional
from .entities import Entity
from .physics import apply_gravity, detect_collisions, resolve_collisions


FIXED_DT = 1.0 / 60.0


class SimulationEngine:
    def __init__(self):
        self.entities: Dict[str, Entity] = {}
        self.tick_count = 0
        self.sim_time = 0.0
        self.running = False

    def create_entity(self, entity_id: str) -> Entity:
        entity = Entity(entity_id)
        self.entities[entity_id] = entity
        return entity

    def get_entity(self, entity_id: str) -> Optional[Entity]:
        return self.entities.get(entity_id)

    def remove_entity(self, entity_id: str):
        if entity_id in self.entities:
            del self.entities[entity_id]

    def get_all_entities(self) -> List[Entity]:
        return list(self.entities.values())

    def tick(self):
        if not self.running:
            return

        dt = FIXED_DT
        entities = self.get_all_entities()

        apply_gravity(entities, dt)

        for entity in entities:
            entity.integrate(dt)

        contacts = detect_collisions(entities)
        resolve_collisions(contacts)

        self.tick_count += 1
        self.sim_time += dt

    def start(self):
        self.running = True

    def stop(self):
        self.running = False

    def reset(self):
        self.tick_count = 0
        self.sim_time = 0.0
        self.entities.clear()

    def get_fixed_dt(self) -> float:
        return FIXED_DT

