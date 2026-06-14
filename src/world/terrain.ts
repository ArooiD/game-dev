import Phaser from 'phaser';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../core/constants';

export function drawTerrain(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0x3f5f39, 1).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  g.fillStyle(0x7bb8c9, 0.85).fillEllipse(540, 250, 620, 300).fillEllipse(2520, 340, 760, 280);
  g.fillStyle(0xa79062, 0.95).fillRect(1040, 170, 620, 92).fillRect(1040, 262, 620, 38);
  for (let i = 0; i < 8; i++) g.fillStyle(0x6f5b3b, 1).fillRect(1060 + i * 72, 284, 42, 36);
  g.lineStyle(26, 0x9a7b4f, 0.45).lineBetween(120, 760, 740, 610).lineBetween(740, 610, 1120, 980).lineBetween(620, 430, 1020, 270);
  g.fillStyle(0x264c2d, 0.55).fillEllipse(910, 420, 520, 260).fillEllipse(2230, 1220, 620, 340).fillEllipse(1480, 1480, 760, 390);
  for (let x = 0; x < WORLD_WIDTH; x += 160) g.lineStyle(1, 0xffffff, 0.04).lineBetween(x, 0, x, WORLD_HEIGHT);
  for (let y = 0; y < WORLD_HEIGHT; y += 160) g.lineStyle(1, 0xffffff, 0.04).lineBetween(0, y, WORLD_WIDTH, y);
}
