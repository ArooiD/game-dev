import Phaser from 'phaser';
import type { BuildingKind } from '../economy/buildingTypes';
import { getBuildingAssetPack, getBuildingStage } from '../assets/buildings/buildingAssetRegistry';
import type { BuildingAssetStage, BuildingCountry } from '../assets/buildings/buildingAssetTypes';

export type BuildingVisualSet = {
  country: BuildingCountry;
  kind: BuildingKind;
  stageId: BuildingAssetStage['id'];
  items: Phaser.GameObjects.GameObject[];
};

export function createBuildingVisuals(
  scene: Phaser.Scene,
  kind: BuildingKind,
  x: number,
  y: number,
  alpha: number,
  depth: number,
  progress = 1,
  completed = true,
  country: BuildingCountry = 'russia',
): BuildingVisualSet {
  const pack = getBuildingAssetPack(country, kind);
  const stage = getBuildingStage(pack, progress, completed);
  return {
    country,
    kind,
    stageId: stage.id,
    items: createPrimitiveStageVisuals(scene, kind, stage.id, x, y, alpha, depth),
  };
}

export function rebuildBuildingVisuals(
  current: BuildingVisualSet,
  scene: Phaser.Scene,
  progress: number,
  completed: boolean,
  x: number,
  y: number,
  alpha: number,
  depth: number,
): BuildingVisualSet {
  const pack = getBuildingAssetPack(current.country, current.kind);
  const stage = getBuildingStage(pack, progress, completed);
  if (stage.id === current.stageId) return current;
  current.items.forEach((item) => item.destroy());
  return {
    ...current,
    stageId: stage.id,
    items: createPrimitiveStageVisuals(scene, current.kind, stage.id, x, y, alpha, depth),
  };
}

function createPrimitiveStageVisuals(scene: Phaser.Scene, kind: BuildingKind, stage: BuildingAssetStage['id'], x: number, y: number, alpha: number, depth: number): Phaser.GameObjects.GameObject[] {
  if (kind === 'town_center') return createTownCenterStageVisuals(scene, stage, x, y, alpha, depth);
  return createGenericStageVisuals(scene, kind, stage, x, y, alpha, depth);
}

function createTownCenterStageVisuals(scene: Phaser.Scene, stage: BuildingAssetStage['id'], x: number, y: number, alpha: number, depth: number): Phaser.GameObjects.GameObject[] {
  if (stage === 'construction_0') return createConstructionFoundation(scene, x, y, alpha, depth, 118, 44);
  if (stage === 'construction_1') return [...createConstructionFoundation(scene, x, y, alpha, depth, 118, 44), ...createTownCenterBody(scene, x, y, alpha, depth, false, false)];
  if (stage === 'construction_2') return [...createTownCenterBody(scene, x, y, alpha, depth, true, false), ...createScaffolding(scene, x, y, alpha, depth, 132, 78)];
  if (stage === 'construction_3') return [...createTownCenterBody(scene, x, y, alpha, depth, true, true), ...createScaffolding(scene, x, y, alpha, depth, 132, 94)];
  if (stage === 'damaged') return createTownCenterBody(scene, x, y, alpha * 0.85, depth, true, true, true);
  if (stage === 'ruins') return createRuins(scene, x, y, alpha, depth, 118, 34);
  return createTownCenterBody(scene, x, y, alpha, depth, true, true);
}

function createTownCenterBody(scene: Phaser.Scene, x: number, y: number, alpha: number, depth: number, withRoof: boolean, withTower: boolean, damaged = false): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  const addRect = (ox: number, oy: number, w: number, h: number, color: number, stroke = 0x20140d, d = 0) => { const r = scene.add.rectangle(x + ox, y + oy, w, h, color, alpha).setStrokeStyle(1, stroke, alpha).setDepth(depth + d); items.push(r); return r; };
  const addTri = (points: number[], color: number, d = 1) => { const p = scene.add.polygon(x, y, points, color, alpha).setStrokeStyle(1, 0x20140d, alpha).setDepth(depth + d); items.push(p); return p; };
  const stone = damaged ? 0x75563b : 0x9b734d;
  const stoneDark = damaged ? 0x513c2b : 0x6f4f35;
  const roof = damaged ? 0x1d1713 : 0x2b2018;
  const glass = 0x101820;
  const trim = 0xd7b56d;
  addRect(0, 0, 130, 38, stone);
  addRect(-46, 8, 38, 30, stoneDark);
  addRect(46, 8, 38, 30, stoneDark);
  if (withRoof) {
    addTri([-69, -18, -4, -31, 61, -18, 69, -7, -69, -7], roof);
    addTri([-68, -1, -27, -13, 14, -1, 20, 8, -74, 8], roof);
    addTri([26, -1, 67, -13, 108, -1, 114, 8, 20, 8], roof);
  }
  addRect(0, -25, 38, 44, stone);
  if (withTower) {
    addTri([-24, -48, 0, -62, 24, -48, 24, -40, -24, -40], roof);
    addRect(0, -65, 24, 34, stoneDark);
    addTri([-15, -86, 0, -98, 15, -86, 15, -80, -15, -80], roof);
    addRect(0, -98, 4, 18, trim, trim);
    addRect(0, -75, 10, 18, glass, trim);
  }
  for (const wx of [-52, -35, -18, 18, 35, 52]) { addRect(wx, -4, 8, 15, glass, trim, 2); addRect(wx, 17, 8, 14, glass, trim, 2); }
  for (const wx of [-10, 10]) addRect(wx, -31, 8, 14, glass, trim, 2);
  addRect(0, 22, 16, 22, 0x0b0806, trim, 3);
  addTri([-10, 11, 0, 2, 10, 11], 0x0b0806, 3);
  if (damaged) createRubble(scene, items, x + 36, y + 28, alpha, depth + 4);
  return items;
}

function createGenericStageVisuals(scene: Phaser.Scene, kind: BuildingKind, stage: BuildingAssetStage['id'], x: number, y: number, alpha: number, depth: number): Phaser.GameObjects.GameObject[] {
  const width = kind === 'house' ? 42 : 66;
  const height = kind === 'house' ? 34 : 48;
  if (stage === 'construction_0') return createConstructionFoundation(scene, x, y, alpha, depth, width, height * 0.55);
  if (stage === 'construction_1') return [...createConstructionFoundation(scene, x, y, alpha, depth, width, height * 0.55), ...createPartialBox(scene, x, y, alpha, depth, width, height * 0.55)];
  if (stage === 'construction_2' || stage === 'construction_3') return [...createGenericComplete(scene, x, y, alpha, depth, width, height, kind), ...createScaffolding(scene, x, y, alpha, depth, width, height)];
  if (stage === 'ruins') return createRuins(scene, x, y, alpha, depth, width, height * 0.45);
  return createGenericComplete(scene, x, y, alpha, depth, width, height, kind);
}

function createGenericComplete(scene: Phaser.Scene, x: number, y: number, alpha: number, depth: number, width: number, height: number, kind: BuildingKind): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  const color = kind === 'foundry' ? 0x4b5563 : kind === 'stable' ? 0x7a542e : kind === 'barracks' ? 0x6b4f2a : 0x7c4a25;
  const body = scene.add.rectangle(x, y, width, height, color, alpha).setStrokeStyle(1, 0x20140d, alpha).setDepth(depth); items.push(body);
  const roof = scene.add.polygon(x, y, [-width / 2 - 5, -height / 2, 0, -height / 2 - 18, width / 2 + 5, -height / 2, width / 2, -height / 2 + 8, -width / 2, -height / 2 + 8], 0x2b2018, alpha).setStrokeStyle(1, 0x20140d, alpha).setDepth(depth + 1); items.push(roof);
  const door = scene.add.rectangle(x, y + height / 2 - 10, 12, 18, 0x0b0806, alpha).setDepth(depth + 2); items.push(door);
  return items;
}

function createConstructionFoundation(scene: Phaser.Scene, x: number, y: number, alpha: number, depth: number, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  const foundation = scene.add.polygon(x, y, [-width / 2, height / 2, 0, height / 2 + 14, width / 2, height / 2, 0, height / 2 - 14], 0x8b7355, alpha).setStrokeStyle(2, 0xd7b56d, alpha).setDepth(depth); items.push(foundation);
  createRubble(scene, items, x - width * 0.25, y + height * 0.35, alpha, depth + 1);
  return items;
}

function createPartialBox(scene: Phaser.Scene, x: number, y: number, alpha: number, depth: number, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const wall = scene.add.rectangle(x, y + 4, width * 0.75, height * 0.7, 0x8a6845, alpha).setStrokeStyle(1, 0x20140d, alpha).setDepth(depth + 2);
  return [wall];
}

function createScaffolding(scene: Phaser.Scene, x: number, y: number, alpha: number, depth: number, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  for (const ox of [-width / 2, -width / 4, width / 4, width / 2]) {
    const line = scene.add.line(0, 0, x + ox, y + height / 2, x + ox + 8, y - height / 2, 0xc49a6c, alpha).setOrigin(0).setDepth(depth + 8);
    items.push(line);
  }
  return items;
}

function createRuins(scene: Phaser.Scene, x: number, y: number, alpha: number, depth: number, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  createRubble(scene, items, x - width * 0.2, y + height * 0.4, alpha, depth);
  createRubble(scene, items, x + width * 0.2, y + height * 0.35, alpha, depth + 1);
  return items;
}

function createRubble(scene: Phaser.Scene, items: Phaser.GameObjects.GameObject[], x: number, y: number, alpha: number, depth: number): void {
  for (let i = 0; i < 5; i++) {
    const r = scene.add.rectangle(x + i * 6 - 12, y + (i % 2) * 4, 8, 5, 0x6f5a42, alpha).setDepth(depth + i * 0.01);
    items.push(r);
  }
}

export function syncBuildingVisuals(visualSet: BuildingVisualSet, scene: Phaser.Scene, progress: number, completed: boolean, x: number, y: number, depth: number, alpha: number): BuildingVisualSet {
  const next = rebuildBuildingVisuals(visualSet, scene, progress, completed, x, y, alpha, depth);
  next.items.forEach((item, index) => {
    const obj = item as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Depth & Phaser.GameObjects.Components.Alpha;
    obj.setPosition(x, y);
    obj.setDepth(depth + index * 0.01);
    obj.setAlpha(alpha);
  });
  return next;
}
