import Phaser from 'phaser';
import type { UnitAnimationState, UnitKind } from './unitTypes';

export type Unit = {
  id: number;
  kind: UnitKind;
  battalionId: number | null;
  sprite: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  selected: boolean;
  target: Phaser.Math.Vector2 | null;
  speed: number;
  hp: number;
  morale: number;
  ammo: number;
  range: number;
  damage: number;
  moraleDamage: number;
  reloadMs: number;
  lastShotAt: number;
  animationState: UnitAnimationState;
  animationTimer: number;
  facingAngle: number;
};
