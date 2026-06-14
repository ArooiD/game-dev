import type { Resources } from '../core/resources';
import { BUILDING_SPECS, type BuildingKind, type ResourceCost } from './buildingTypes';
import type { Building } from './productionTypes';
import type { UnitKind } from '../units/unitTypes';

export const UNIT_TRAIN_TIME_MS: Record<UnitKind, number> = {
  worker: 1800,
  soldier: 2600,
  specialist: 3200,
  cavalry: 4200,
  artillery: 7200,
};

export const UNIT_COSTS: Record<UnitKind, ResourceCost> = {
  worker: { food: 35 },
  soldier: { food: 45, iron: 25 },
  specialist: { food: 55, iron: 20, gold: 20 },
  cavalry: { food: 90, gold: 35 },
  artillery: { wood: 90, iron: 120, gold: 80 },
};

export function canAfford(resources: Resources, cost: ResourceCost): boolean {
  return Object.entries(cost).every(([key, value]) => resources[key as keyof ResourceCost] >= (value ?? 0));
}

export function spendResources(resources: Resources, cost: ResourceCost): void {
  for (const [key, value] of Object.entries(cost)) {
    resources[key as keyof ResourceCost] -= value ?? 0;
  }
}

export function canPlaceBuilding(existing: Building[], x: number, y: number, kind: BuildingKind): boolean {
  const spec = BUILDING_SPECS[kind];
  return existing.every((building) => {
    const minDistance = Math.max(spec.width, spec.height) / 96 + 0.8;
    return Math.hypot(building.world.x - x, building.world.y - y) > minDistance;
  });
}

export function canTrain(building: Building, unitKind: UnitKind): boolean {
  return building.completed && BUILDING_SPECS[building.kind].trains.includes(unitKind);
}
