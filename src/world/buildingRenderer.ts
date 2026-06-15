import Phaser from 'phaser';
import type { BuildingKind } from '../economy/buildingTypes';

export function createBuildingVisuals(
  scene: Phaser.Scene,
  kind: BuildingKind,
  x: number,
  y: number,
  alpha: number,
  depth: number,
): Phaser.GameObjects.GameObject[] {
  if (kind === 'town_center') return createTownCenterVisuals(scene, x, y, alpha, depth);
  return [];
}

function createTownCenterVisuals(scene: Phaser.Scene, x: number, y: number, alpha: number, depth: number): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  const addRect = (ox: number, oy: number, w: number, h: number, color: number, stroke = 0x20140d) => {
    const r = scene.add.rectangle(x + ox, y + oy, w, h, color, alpha).setStrokeStyle(1, stroke, alpha).setDepth(depth);
    items.push(r);
    return r;
  };
  const addTri = (points: number[], color: number) => {
    const p = scene.add.polygon(x, y, points, color, alpha).setStrokeStyle(1, 0x20140d, alpha).setDepth(depth + 1);
    items.push(p);
    return p;
  };
  const stone = 0x9b734d;
  const stoneDark = 0x6f4f35;
  const roof = 0x2b2018;
  const glass = 0x101820;
  const trim = 0xd7b56d;

  addRect(0, 0, 130, 38, stone);
  addRect(-46, 8, 38, 30, stoneDark);
  addRect(46, 8, 38, 30, stoneDark);
  addTri([-69, -18, -4, -31, 61, -18, 69, -7, -69, -7], roof);
  addTri([-68, -1, -27, -13, 14, -1, 20, 8, -74, 8], roof);
  addTri([26, -1, 67, -13, 108, -1, 114, 8, 20, 8], roof);
  addRect(0, -25, 38, 44, stone);
  addTri([-24, -48, 0, -62, 24, -48, 24, -40, -24, -40], roof);
  addRect(0, -65, 24, 34, stoneDark);
  addTri([-15, -86, 0, -98, 15, -86, 15, -80, -15, -80], roof);
  addRect(0, -98, 4, 18, trim, trim);

  for (const wx of [-52, -35, -18, 18, 35, 52]) {
    addRect(wx, -4, 8, 15, glass, trim);
    addRect(wx, 17, 8, 14, glass, trim);
  }
  for (const wx of [-10, 10]) {
    addRect(wx, -31, 8, 14, glass, trim);
    addRect(wx, -57, 6, 15, glass, trim);
  }
  addRect(0, 22, 16, 22, 0x0b0806, trim);
  addTri([-10, 11, 0, 2, 10, 11], 0x0b0806);
  addRect(0, -75, 10, 18, glass, trim);
  return items;
}

export function syncBuildingVisuals(items: Phaser.GameObjects.GameObject[], x: number, y: number, depth: number, alpha: number): void {
  items.forEach((item, index) => {
    const obj = item as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Depth & Phaser.GameObjects.Components.Alpha;
    obj.setPosition(x, y);
    obj.setDepth(depth + index * 0.01);
    obj.setAlpha(alpha);
  });
}
