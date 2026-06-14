export type UnitModelVariant = 'worker-apron' | 'worker-cap' | 'worker-coat' | 'infantry-line' | 'infantry-guard' | 'infantry-veteran' | 'specialist-officer' | 'specialist-sapper' | 'cavalry-light' | 'cavalry-heavy' | 'cannon-field' | 'cannon-heavy';

export type BuildingModelVariant = 'town-center-a' | 'town-center-b' | 'house-a' | 'house-b' | 'barracks-a' | 'barracks-b' | 'stable-a' | 'stable-b' | 'foundry-a' | 'foundry-b' | 'storehouse-a' | 'storehouse-b';

export type VisualModelVariant = UnitModelVariant | BuildingModelVariant;

const UNIT_VARIANTS: Record<string, UnitModelVariant[]> = {
  worker: ['worker-apron', 'worker-cap', 'worker-coat'],
  soldier: ['infantry-line', 'infantry-guard', 'infantry-veteran'],
  specialist: ['specialist-officer', 'specialist-sapper'],
  cavalry: ['cavalry-light', 'cavalry-heavy'],
  artillery: ['cannon-field', 'cannon-heavy'],
};

const BUILDING_VARIANTS: Record<string, BuildingModelVariant[]> = {
  town_center: ['town-center-a', 'town-center-b'],
  house: ['house-a', 'house-b'],
  barracks: ['barracks-a', 'barracks-b'],
  stable: ['stable-a', 'stable-b'],
  foundry: ['foundry-a', 'foundry-b'],
  storehouse: ['storehouse-a', 'storehouse-b'],
};

export function pickUnitModelVariant(kind: string, seed: number): UnitModelVariant {
  const variants = UNIT_VARIANTS[kind] ?? UNIT_VARIANTS.worker;
  return variants[Math.abs(seed) % variants.length];
}

export function pickBuildingModelVariant(kind: string, seed: number): BuildingModelVariant {
  const variants = BUILDING_VARIANTS[kind] ?? BUILDING_VARIANTS.house;
  return variants[Math.abs(seed) % variants.length];
}
