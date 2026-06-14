import type { UnitKind } from '../units/unitTypes';

export type ResourceKind = 'food' | 'wood' | 'iron' | 'gold';
export type ResourceCost = Partial<Record<ResourceKind, number>>;

export type BuildingKind = 'town_center' | 'house' | 'barracks' | 'stable' | 'foundry' | 'storehouse';

export type BuildingSpec = {
  label: string;
  short: string;
  color: number;
  width: number;
  height: number;
  buildTimeMs: number;
  hitpoints: number;
  cost: ResourceCost;
  populationCapBonus?: number;
  trains: UnitKind[];
};

export const BUILDING_SPECS: Record<BuildingKind, BuildingSpec> = {
  town_center: { label: 'Ратуша', short: 'TC', color: 0x8b5e34, width: 64, height: 48, buildTimeMs: 9000, hitpoints: 1800, cost: { wood: 250, iron: 80, gold: 80 }, populationCapBonus: 20, trains: ['worker'] },
  house: { label: 'Дом', short: 'H', color: 0x7c4a25, width: 38, height: 30, buildTimeMs: 3500, hitpoints: 500, cost: { wood: 70 }, populationCapBonus: 10, trains: [] },
  barracks: { label: 'Казармы', short: 'B', color: 0x6b4f2a, width: 58, height: 42, buildTimeMs: 7000, hitpoints: 1200, cost: { wood: 180, iron: 120 }, trains: ['soldier', 'specialist'] },
  stable: { label: 'Конюшня', short: 'S', color: 0x7a542e, width: 62, height: 42, buildTimeMs: 7500, hitpoints: 1100, cost: { wood: 170, food: 120, gold: 60 }, trains: ['cavalry'] },
  foundry: { label: 'Литейная', short: 'F', color: 0x4b5563, width: 62, height: 46, buildTimeMs: 9500, hitpoints: 1400, cost: { wood: 150, iron: 220, gold: 120 }, trains: ['artillery'] },
  storehouse: { label: 'Склад', short: 'W', color: 0x5b4a2f, width: 46, height: 34, buildTimeMs: 4500, hitpoints: 700, cost: { wood: 100 }, trains: [] },
};
