import Phaser from 'phaser';
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH, worldToIso } from './iso';

export function drawIsoTerrain(scene: Phaser.Scene, cols = 26, rows = 20): void {
  const g = scene.add.graphics().setDepth(-1000);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p = worldToIso(x, y);
      const color = pickTileColor(x, y);
      drawDiamond(g, p.x, p.y, ISO_TILE_WIDTH, ISO_TILE_HEIGHT, color, 0.95);
      g.lineStyle(1, 0x203323, 0.45);
      g.beginPath();
      g.moveTo(p.x, p.y - ISO_TILE_HEIGHT / 2);
      g.lineTo(p.x + ISO_TILE_WIDTH / 2, p.y);
      g.lineTo(p.x, p.y + ISO_TILE_HEIGHT / 2);
      g.lineTo(p.x - ISO_TILE_WIDTH / 2, p.y);
      g.closePath();
      g.strokePath();
    }
  }

  drawIsoBuilding(g, 11, 3, 0x8b5e34);
  drawIsoBuilding(g, 12, 3, 0x8b5e34);
  drawIsoBuilding(g, 13, 3, 0x8b5e34);
  drawIsoBuilding(g, 8, 9, 0x6b4f2a);
  drawIsoBuilding(g, 18, 12, 0x6b4f2a);
}

function pickTileColor(x: number, y: number): number {
  if ((x > 2 && x < 7 && y < 4) || (x > 18 && y < 5)) return 0x5aa7b8;
  if ((x + y) % 7 === 0) return 0x477a3d;
  if ((x > 10 && x < 16 && y > 2 && y < 6)) return 0x9a7b4f;
  return 0x3f6f39;
}

function drawDiamond(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number, alpha: number): void {
  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(x, y - h / 2);
  g.lineTo(x + w / 2, y);
  g.lineTo(x, y + h / 2);
  g.lineTo(x - w / 2, y);
  g.closePath();
  g.fillPath();
}

function drawIsoBuilding(g: Phaser.GameObjects.Graphics, tileX: number, tileY: number, color: number): void {
  const p = worldToIso(tileX, tileY);
  drawDiamond(g, p.x, p.y, ISO_TILE_WIDTH * 0.8, ISO_TILE_HEIGHT * 0.8, color, 1);
  g.fillStyle(0x3a2413, 1).fillTriangle(p.x - 28, p.y - 10, p.x, p.y - 38, p.x + 28, p.y - 10);
  g.fillStyle(0x5a3920, 1).fillRect(p.x - 24, p.y - 10, 48, 30);
}
