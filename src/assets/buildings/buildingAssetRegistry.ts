import type { BuildingKind } from '../../economy/buildingTypes';
import type { BuildingAssetPack, BuildingCountry, BuildingAssetStage } from './buildingAssetTypes';

const STAGE_BREAKS: Array<[BuildingAssetStage['id'], number, number]> = [
  ['construction_0', 0, 0.25],
  ['construction_1', 0.25, 0.5],
  ['construction_2', 0.5, 0.75],
  ['construction_3', 0.75, 1],
  ['complete', 1, 1],
];

function makePrimitiveLayers(kind: BuildingKind, stage: BuildingAssetStage['id']) {
  const base = `russia/${kind}/${stage}`;
  return [
    { name: 'shadow', source: `${base}/shadow.svg`, format: 'svg' as const, depthOffset: -4, occludable: false, alphaMode: 'always' as const },
    { name: 'base', source: `${base}/base.svg`, format: 'svg' as const, depthOffset: 0, occludable: true, alphaMode: 'occludable' as const },
    { name: 'roof', source: `${base}/roof.svg`, format: 'svg' as const, depthOffset: 2, occludable: true, alphaMode: 'occludable' as const },
    { name: 'details', source: `${base}/details.svg`, format: 'svg' as const, depthOffset: 3, occludable: true, alphaMode: 'occludable' as const },
  ];
}

function makePack(country: BuildingCountry, kind: BuildingKind, footprint: { w: number; h: number }, hitbox: { w: number; h: number; offsetX: number; offsetY: number }): BuildingAssetPack {
  return {
    id: `${country}.${kind}`,
    country,
    kind,
    anchor: { x: 0.5, y: 0.82 },
    footprint,
    hitbox,
    occlusion: { enabled: true, fadeAlpha: 0.35, fadeDistance: 1.25 },
    stages: [
      ...STAGE_BREAKS.map(([id, fromProgress, toProgress]) => ({ id, fromProgress, toProgress, layers: makePrimitiveLayers(kind, id) })),
      { id: 'damaged', fromProgress: 1, toProgress: 1, layers: makePrimitiveLayers(kind, 'damaged') },
      { id: 'ruins', fromProgress: 1, toProgress: 1, layers: makePrimitiveLayers(kind, 'ruins') },
    ],
  };
}

export const BUILDING_ASSET_REGISTRY: Record<BuildingCountry, Partial<Record<BuildingKind, BuildingAssetPack>>> = {
  russia: {
    town_center: makePack('russia', 'town_center', { w: 4, h: 3 }, { w: 140, h: 116, offsetX: 0, offsetY: -52 }),
    house: makePack('russia', 'house', { w: 2, h: 2 }, { w: 46, h: 38, offsetX: 0, offsetY: -22 }),
    barracks: makePack('russia', 'barracks', { w: 3, h: 2 }, { w: 66, h: 52, offsetX: 0, offsetY: -30 }),
    stable: makePack('russia', 'stable', { w: 3, h: 2 }, { w: 68, h: 50, offsetX: 0, offsetY: -28 }),
    foundry: makePack('russia', 'foundry', { w: 3, h: 2 }, { w: 68, h: 56, offsetX: 0, offsetY: -32 }),
  },
  europe: {},
  ottoman: {},
};

export function getBuildingAssetPack(country: BuildingCountry, kind: BuildingKind): BuildingAssetPack {
  const pack = BUILDING_ASSET_REGISTRY[country]?.[kind] ?? BUILDING_ASSET_REGISTRY.russia[kind];
  if (!pack) throw new Error(`Missing building asset pack for ${country}.${kind}`);
  return pack;
}

export function getBuildingStage(pack: BuildingAssetPack, progress: number, completed: boolean): BuildingAssetStage {
  if (completed) return pack.stages.find((stage) => stage.id === 'complete') ?? pack.stages[0];
  const normalized = Math.max(0, Math.min(0.999, progress));
  return pack.stages.find((stage) => normalized >= stage.fromProgress && normalized < stage.toProgress) ?? pack.stages[0];
}
