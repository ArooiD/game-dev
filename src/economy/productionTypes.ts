import type Phaser from 'phaser';
import type { BuildingKind } from './buildingTypes';
import type { UnitKind } from '../units/unitTypes';

export type Building = {
  id: number;
  kind: BuildingKind;
  world: Phaser.Math.Vector2;
  sprite: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  completed: boolean;
  progressMs: number;
  buildTimeMs: number;
  hitpoints: number;
  selected: boolean;
  assignedWorkerIds: number[];
  queue: ProductionOrder[];
};

export type ProductionOrder = {
  id: number;
  unitKind: UnitKind;
  progressMs: number;
  trainTimeMs: number;
};
