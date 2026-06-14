import Phaser from 'phaser';

export type Formation = 'line' | 'column' | 'square' | 'wedge' | 'doubleLine' | 'skirmish';

export function rotate(v: Phaser.Math.Vector2, angle: number): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(v.x * Math.cos(angle) - v.y * Math.sin(angle), v.x * Math.sin(angle) + v.y * Math.cos(angle));
}

export function getGroupOffsets(count: number, angle: number): Phaser.Math.Vector2[] {
  const raw: Phaser.Math.Vector2[] = [];
  const spacing = 180;
  for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i - (count - 1) / 2) * spacing, 0));
  return raw.map((v) => rotate(v, angle));
}

export function getFormationOffsets(count: number, angle: number, formation: Formation): Phaser.Math.Vector2[] {
  const raw: Phaser.Math.Vector2[] = [];
  const gap = formation === 'skirmish' ? 34 : 22;
  if (formation === 'column') {
    for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % 4) * gap - 1.5 * gap, Math.floor(i / 4) * gap));
  } else if (formation === 'square') {
    const side = Math.ceil(Math.sqrt(count));
    for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % side) * gap - (side - 1) * gap / 2, Math.floor(i / side) * gap - (side - 1) * gap / 2));
  } else if (formation === 'wedge') {
    let placed = 0;
    for (let row = 0; placed < count; row++) {
      const rowCount = row * 2 + 1;
      for (let col = 0; col < rowCount && placed < count; col++) {
        raw.push(new Phaser.Math.Vector2((col - row) * gap, row * gap));
        placed++;
      }
    }
  } else if (formation === 'doubleLine') {
    const width = Math.ceil(count / 2);
    for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % width) * gap - (width - 1) * gap / 2, Math.floor(i / width) * gap));
  } else {
    const width = formation === 'skirmish' ? Math.min(16, Math.max(1, count)) : Math.min(12, Math.max(1, count));
    for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % width) * gap - (width - 1) * gap / 2, Math.floor(i / width) * gap));
  }
  return raw.map((v) => rotate(v, angle));
}
