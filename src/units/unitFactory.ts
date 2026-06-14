import Phaser from 'phaser';
import type { Unit } from './Unit';
import type { UnitKind } from './unitTypes';
import { UNIT_SPECS } from './unitTypes';

export function createUnit(scene: Phaser.Scene, id: number, x: number, y: number, kind: UnitKind, enemy: boolean, battalionId: number | null): Unit {
  const spec = UNIT_SPECS[kind];
  const color = enemy ? 0x8b1e1e : spec.color;
  const sprite = scene.add.rectangle(x, y, spec.width, spec.height, color).setStrokeStyle(1, 0x111827);
  const label = scene.add.text(x, y - 16, spec.short, { fontFamily: 'Arial', fontSize: '10px', color: '#e5e7eb' }).setOrigin(0.5).setDepth(20);
  return {
    id,
    kind,
    battalionId,
    sprite,
    label,
    selected: false,
    target: null,
    speed: enemy ? spec.speed * 0.85 : spec.speed,
    hp: spec.hp,
    morale: spec.morale,
    ammo: spec.ammo,
    range: spec.range,
    damage: spec.damage,
    moraleDamage: spec.moraleDamage,
    reloadMs: spec.reloadMs,
    lastShotAt: 0,
    animationState: 'idle',
    animationTimer: 0,
    facingAngle: 0,
  };
}
