import Phaser from 'phaser';

export const ISO_TILE_WIDTH = 96;
export const ISO_TILE_HEIGHT = 48;
export const ISO_ORIGIN_X = 1600;
export const ISO_ORIGIN_Y = 120;

export function worldToIso(x: number, y: number): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(
    ISO_ORIGIN_X + (x - y) * ISO_TILE_WIDTH / 2,
    ISO_ORIGIN_Y + (x + y) * ISO_TILE_HEIGHT / 2,
  );
}

export function isoToWorld(screenX: number, screenY: number): Phaser.Math.Vector2 {
  const x = screenX - ISO_ORIGIN_X;
  const y = screenY - ISO_ORIGIN_Y;
  return new Phaser.Math.Vector2(
    y / ISO_TILE_HEIGHT + x / ISO_TILE_WIDTH,
    y / ISO_TILE_HEIGHT - x / ISO_TILE_WIDTH,
  );
}

export function isoDepth(worldX: number, worldY: number): number {
  return Math.floor((worldX + worldY) * 10);
}
