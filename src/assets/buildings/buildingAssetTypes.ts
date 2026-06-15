import type { BuildingKind } from '../../economy/buildingTypes';

export type BuildingCountry = 'russia' | 'europe' | 'ottoman';
export type BuildingVisualFormat = 'svg' | 'png' | 'webp' | 'primitive';
export type BuildingStageId =
  | 'construction_0'
  | 'construction_1'
  | 'construction_2'
  | 'construction_3'
  | 'complete'
  | 'damaged'
  | 'ruins';

export type BuildingAssetLayer = {
  name: string;
  source: string;
  runtimeTexture?: string;
  format: BuildingVisualFormat;
  depthOffset: number;
  occludable: boolean;
  alphaMode?: 'always' | 'occludable' | 'constructionOnly';
};

export type BuildingAssetStage = {
  id: BuildingStageId;
  fromProgress: number;
  toProgress: number;
  layers: BuildingAssetLayer[];
};

export type BuildingAssetPack = {
  id: string;
  kind: BuildingKind;
  country: BuildingCountry;
  anchor: { x: number; y: number };
  footprint: { w: number; h: number };
  hitbox: { w: number; h: number; offsetX: number; offsetY: number };
  occlusion: { enabled: boolean; fadeAlpha: number; fadeDistance: number };
  stages: BuildingAssetStage[];
};
