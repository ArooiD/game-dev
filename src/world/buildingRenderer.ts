import Phaser from 'phaser';
import type { BuildingKind } from '../economy/buildingTypes';
import { getBuildingAssetPack, getBuildingStage } from '../assets/buildings/buildingAssetRegistry';
import type { BuildingAssetStage, BuildingCountry } from '../assets/buildings/buildingAssetTypes';

export type BuildingVisualSet = {
  country: BuildingCountry;
  kind: BuildingKind;
  stageId: BuildingAssetStage['id'];
  items: Phaser.GameObjects.GameObject[];
  root: Phaser.GameObjects.Container;
};

type ShapeKind = 'rect' | 'poly' | 'line';
type ShapeSpec = {
  kind: ShapeKind;
  points?: number[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  color: number;
  alpha?: number;
  stroke?: number;
  lineWidth?: number;
  depth?: number;
};

/**
 * Создаёт визуальное представление здания с использованием asset registry.
 * 
 * ⚠️ ВАЖНО:
 * - Возвращает BuildingVisualSet с container root
 * - Все части здания — дети этого root
 * - Не двигайте части независимо! Используйте root.setPosition()
 * 
 * @see .agents/CONTEXT.md#система-зданий
 * @see AGENTS.md#building-renderer
 * 
 * @example
 * ```typescript
 * const visuals = createBuildingVisuals(scene, 'house', 100, 200, 1, 0);
 * scene.add.existing(visuals.root);
 * 
 * // Перемещение
 * visuals.root.setPosition(150, 250);
 * 
 * // Изменение прозрачности
 * visuals.root.setAlpha(0.5);
 * ```
 * 
 * @param scene - Phaser сцена
 * @param kind - Тип здания (town_center, house, barracks...)
 * @param x - X координата в мире
 * @param y - Y координата в мире
 * @param alpha - Прозрачность (0-1)
 * @param depth - Z-index для сортировки
 * @param progress - Прогресс строительства (0-1)
 * @param completed - Здание завершено?
 * @param country - Страна (russia, europe, ottoman)
 * @returns BuildingVisualSet с root container
 */
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
  const root = scene.add.container(x, y).setDepth(depth).setAlpha(alpha);
  return {
    country,
    kind,
    stageId: stage.id,
    root,
    items: createPrimitiveStageVisuals(scene, root, kind, stage.id),
  };
}

/**
 * Перестраивает визуальное представление здания при смене стадии строительства.
 * 
 * ⚠️ ВАЖНО:
 * - НЕ модифицирует переданный объект, возвращает НОВЫЙ
 * - Всегда присваивайте результат: building.visuals = rebuildBuildingVisuals(...)
 * - Сохраняет country и kind из текущего состояния
 * 
 * @see .agents/CONTEXT.md#система-зданий
 * 
 * @param current - Текущий BuildingVisualSet
 * @param scene - Phaser сцена
 * @param progress - Прогресс строительства (0-1)
 * @param completed - Здание завершено?
 * @param x - Новая X координата
 * @param y - Новая Y координата
 * @param alpha - Новая прозрачность
 * @param depth - Новый Z-index
 * @returns НОВЫЙ BuildingVisualSet с обновлёнными визуалами
 */
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
  current.root.setPosition(x, y).setDepth(depth).setAlpha(alpha);
  if (stage.id === current.stageId) return current;
  current.root.removeAll(true);
  return {
    ...current,
    stageId: stage.id,
    items: createPrimitiveStageVisuals(scene, current.root, current.kind, stage.id),
  };
}

function createPrimitiveStageVisuals(scene: Phaser.Scene, root: Phaser.GameObjects.Container, kind: BuildingKind, stage: BuildingAssetStage['id']): Phaser.GameObjects.GameObject[] {
  if (kind === 'town_center') return createTownCenterStageVisuals(scene, root, stage);
  return createGenericStageVisuals(scene, root, kind, stage);
}

function addShape(scene: Phaser.Scene, root: Phaser.GameObjects.Container, spec: ShapeSpec): Phaser.GameObjects.GameObject {
  let item: Phaser.GameObjects.GameObject;
  if (spec.kind === 'rect') {
    item = scene.add.rectangle(spec.x ?? 0, spec.y ?? 0, spec.w ?? 1, spec.h ?? 1, spec.color, spec.alpha ?? 1);
    if (spec.stroke !== undefined) (item as Phaser.GameObjects.Rectangle).setStrokeStyle(spec.lineWidth ?? 1, spec.stroke, spec.alpha ?? 1);
  } else if (spec.kind === 'line') {
    item = scene.add.line(0, 0, spec.x1 ?? 0, spec.y1 ?? 0, spec.x2 ?? 0, spec.y2 ?? 0, spec.color, spec.alpha ?? 1).setOrigin(0);
    (item as Phaser.GameObjects.Line).setLineWidth(spec.lineWidth ?? 2);
  } else {
    item = scene.add.polygon(0, 0, spec.points ?? [], spec.color, spec.alpha ?? 1);
    if (spec.stroke !== undefined) (item as Phaser.GameObjects.Polygon).setStrokeStyle(spec.lineWidth ?? 1, spec.stroke, spec.alpha ?? 1);
  }
  item.setDepth(spec.depth ?? 0);
  root.add(item);
  return item;
}

function createTownCenterStageVisuals(scene: Phaser.Scene, root: Phaser.GameObjects.Container, stage: BuildingAssetStage['id']): Phaser.GameObjects.GameObject[] {
  if (stage === 'construction_0') return createConstructionFoundation(scene, root, 126, 46);
  if (stage === 'construction_1') return [...createConstructionFoundation(scene, root, 126, 46), ...createTownCenterBody(scene, root, false, false, 0.65)];
  if (stage === 'construction_2') return [...createTownCenterBody(scene, root, true, false, 0.86), ...createScaffolding(scene, root, 128, 78)];
  if (stage === 'construction_3') return [...createTownCenterBody(scene, root, true, true, 0.95), ...createScaffolding(scene, root, 132, 94)];
  if (stage === 'damaged') return createTownCenterBody(scene, root, true, true, 1, true);
  if (stage === 'ruins') return createRuins(scene, root, 118, 34);
  return createTownCenterBody(scene, root, true, true, 1);
}

function createTownCenterBody(scene: Phaser.Scene, root: Phaser.GameObjects.Container, withRoof: boolean, withTower: boolean, scale = 1, damaged = false): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  const s = (value: number) => value * scale;
  const stone = damaged ? 0x75563b : 0x9b734d;
  const stoneDark = damaged ? 0x513c2b : 0x6f4f35;
  const roof = damaged ? 0x1d1713 : 0x2b2018;
  const glass = 0x101820;
  const trim = 0xd7b56d;
  items.push(addShape(scene, root, { kind: 'poly', points: [-70, 18, 0, 39, 70, 18, 0, -3], color: 0x000000, alpha: 0.18, depth: -3 }));
  items.push(addShape(scene, root, { kind: 'rect', x: 0, y: s(2), w: s(118), h: s(34), color: stone, stroke: 0x20140d, depth: 0 }));
  items.push(addShape(scene, root, { kind: 'rect', x: s(-41), y: s(8), w: s(32), h: s(28), color: stoneDark, stroke: 0x20140d, depth: 0.1 }));
  items.push(addShape(scene, root, { kind: 'rect', x: s(41), y: s(8), w: s(32), h: s(28), color: stoneDark, stroke: 0x20140d, depth: 0.1 }));
  if (withRoof) {
    items.push(addShape(scene, root, { kind: 'poly', points: [-64, -15, -18, -30, 60, -15, 68, -5, -68, -5], color: roof, stroke: 0x20140d, depth: 1 }));
    items.push(addShape(scene, root, { kind: 'poly', points: [-58, 0, -34, -11, -8, 0, -4, 8, -62, 8], color: roof, stroke: 0x20140d, depth: 1.1 }));
    items.push(addShape(scene, root, { kind: 'poly', points: [8, 0, 34, -11, 58, 0, 62, 8, 4, 8], color: roof, stroke: 0x20140d, depth: 1.1 }));
  }
  items.push(addShape(scene, root, { kind: 'rect', x: 0, y: s(-24), w: s(34), h: s(46), color: stone, stroke: 0x20140d, depth: 2 }));
  if (withTower) {
    items.push(addShape(scene, root, { kind: 'poly', points: [-24, -48, 0, -62, 24, -48, 22, -39, -22, -39], color: roof, stroke: 0x20140d, depth: 3 }));
    items.push(addShape(scene, root, { kind: 'rect', x: 0, y: -65, w: 22, h: 32, color: stoneDark, stroke: 0x20140d, depth: 4 }));
    items.push(addShape(scene, root, { kind: 'poly', points: [-14, -87, 0, -99, 14, -87, 12, -80, -12, -80], color: roof, stroke: 0x20140d, depth: 5 }));
    items.push(addShape(scene, root, { kind: 'rect', x: 0, y: -101, w: 4, h: 18, color: trim, stroke: trim, depth: 6 }));
    items.push(addShape(scene, root, { kind: 'rect', x: 0, y: -75, w: 9, h: 16, color: glass, stroke: trim, depth: 6 }));
  }
  for (const wx of [-50, -32, -14, 14, 32, 50]) {
    items.push(addShape(scene, root, { kind: 'rect', x: s(wx), y: s(-4), w: s(7), h: s(12), color: glass, stroke: trim, depth: 6 }));
    items.push(addShape(scene, root, { kind: 'rect', x: s(wx), y: s(17), w: s(7), h: s(11), color: glass, stroke: trim, depth: 6 }));
  }
  for (const wx of [-9, 9]) items.push(addShape(scene, root, { kind: 'rect', x: s(wx), y: s(-31), w: s(7), h: s(12), color: glass, stroke: trim, depth: 6 }));
  items.push(addShape(scene, root, { kind: 'rect', x: 0, y: s(22), w: s(15), h: s(21), color: 0x0b0806, stroke: trim, depth: 7 }));
  items.push(addShape(scene, root, { kind: 'poly', points: [-9, 11, 0, 2, 9, 11], color: 0x0b0806, stroke: trim, depth: 7 }));
  if (damaged) createRubble(scene, root, items, 36, 29, 1, 8);
  return items;
}

function createGenericStageVisuals(scene: Phaser.Scene, root: Phaser.GameObjects.Container, kind: BuildingKind, stage: BuildingAssetStage['id']): Phaser.GameObjects.GameObject[] {
  const width = kind === 'house' ? 42 : 66;
  const height = kind === 'house' ? 34 : 48;
  if (stage === 'construction_0') return createConstructionFoundation(scene, root, width, height * 0.55);
  if (stage === 'construction_1') return [...createConstructionFoundation(scene, root, width, height * 0.55), ...createPartialBox(scene, root, width, height * 0.55)];
  if (stage === 'construction_2' || stage === 'construction_3') return [...createGenericComplete(scene, root, width, height, kind), ...createScaffolding(scene, root, width, height)];
  if (stage === 'ruins') return createRuins(scene, root, width, height * 0.45);
  return createGenericComplete(scene, root, width, height, kind);
}

function createGenericComplete(scene: Phaser.Scene, root: Phaser.GameObjects.Container, width: number, height: number, kind: BuildingKind): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  const color = kind === 'foundry' ? 0x4b5563 : kind === 'stable' ? 0x7a542e : kind === 'barracks' ? 0x6b4f2a : 0x7c4a25;
  items.push(addShape(scene, root, { kind: 'poly', points: [-width / 2 - 5, height / 2, 0, height / 2 + 12, width / 2 + 5, height / 2, 0, height / 2 - 10], color: 0x000000, alpha: 0.18, depth: -3 }));
  items.push(addShape(scene, root, { kind: 'rect', x: 0, y: 4, w: width, h: height, color, stroke: 0x20140d, depth: 0 }));
  items.push(addShape(scene, root, { kind: 'poly', points: [-width / 2 - 6, -height / 2 + 2, 0, -height / 2 - 18, width / 2 + 6, -height / 2 + 2, width / 2, -height / 2 + 12, -width / 2, -height / 2 + 12], color: 0x2b2018, stroke: 0x20140d, depth: 2 }));
  items.push(addShape(scene, root, { kind: 'rect', x: 0, y: height / 2 - 9, w: 12, h: 18, color: 0x0b0806, depth: 3 }));
  if (kind !== 'house') {
    items.push(addShape(scene, root, { kind: 'rect', x: -width / 3, y: 2, w: 8, h: 12, color: 0x101820, stroke: 0xd7b56d, depth: 3 }));
    items.push(addShape(scene, root, { kind: 'rect', x: width / 3, y: 2, w: 8, h: 12, color: 0x101820, stroke: 0xd7b56d, depth: 3 }));
  }
  return items;
}

function createConstructionFoundation(scene: Phaser.Scene, root: Phaser.GameObjects.Container, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  items.push(addShape(scene, root, { kind: 'poly', points: [-width / 2, height / 2, 0, height / 2 + 14, width / 2, height / 2, 0, height / 2 - 14], color: 0x8b7355, stroke: 0xd7b56d, lineWidth: 2, depth: 0 }));
  createRubble(scene, root, items, -width * 0.25, height * 0.35, 1, 1);
  return items;
}

function createPartialBox(scene: Phaser.Scene, root: Phaser.GameObjects.Container, width: number, height: number): Phaser.GameObjects.GameObject[] {
  return [addShape(scene, root, { kind: 'rect', x: 0, y: 4, w: width * 0.75, h: height * 0.7, color: 0x8a6845, stroke: 0x20140d, depth: 2 })];
}

function createScaffolding(scene: Phaser.Scene, root: Phaser.GameObjects.Container, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  for (const ox of [-width / 2, -width / 4, width / 4, width / 2]) items.push(addShape(scene, root, { kind: 'line', x1: ox, y1: height / 2, x2: ox + 8, y2: -height / 2, color: 0xc49a6c, alpha: 0.9, lineWidth: 2, depth: 8 }));
  return items;
}

function createRuins(scene: Phaser.Scene, root: Phaser.GameObjects.Container, width: number, height: number): Phaser.GameObjects.GameObject[] {
  const items: Phaser.GameObjects.GameObject[] = [];
  createRubble(scene, root, items, -width * 0.2, height * 0.4, 1, 0);
  createRubble(scene, root, items, width * 0.2, height * 0.35, 1, 1);
  return items;
}

function createRubble(scene: Phaser.Scene, root: Phaser.GameObjects.Container, items: Phaser.GameObjects.GameObject[], x: number, y: number, alpha: number, depth: number): void {
  for (let i = 0; i < 5; i++) items.push(addShape(scene, root, { kind: 'rect', x: x + i * 6 - 12, y: y + (i % 2) * 4, w: 8, h: 5, color: 0x6f5a42, alpha, depth: depth + i * 0.01 }));
}

/**
 * Синхронизирует визуальное представление здания с текущим состоянием.
 * 
 * ⚠️ КРИТИЧНО ВАЖНО:
 * - Возвращает НОВЫЙ BuildingVisualSet (не модифицирует переданный!)
 * - ВСЕГДА присваивайте результат: building.visuals = syncBuildingVisuals(...)
 * - НЕ используйте building.visuals.forEach(...) — это вызовет ошибку!
 * 
 * @see .agents/CONTEXT.md#система-зданий
 * @see AGENTS.md#building-renderer
 * @see ADR-002 в .agents/docs/DECISIONS.md
 * 
 * @example
 * ```typescript
 * // ✅ ПРАВИЛЬНО:
 * building.visuals = syncBuildingVisuals(
 *   building.visuals,
 *   scene,
 *   progress,
 *   building.completed,
 *   x, y,
 *   depth,
 *   alpha
 * );
 * 
 * // ❌ НЕПРАВИЛЬНО (вызовет ошибку):
 * building.visuals.forEach(part => part.setPosition(x, y));
 * 
 * // ✅ АЛЬТЕРНАТИВА для управления прозрачностью:
 * building.visuals.root.setAlpha(alpha);
 * ```
 * 
 * @param visualSet - Текущий BuildingVisualSet
 * @param scene - Phaser сцена
 * @param progress - Прогресс строительства (0-1)
 * @param completed - Здание завершено?
 * @param x - X координата
 * @param y - Y координата
 * @param depth - Z-index
 * @param alpha - Прозрачность (0-1)
 * @returns НОВЫЙ BuildingVisualSet с синхронизированными визуалами
 */
export function syncBuildingVisuals(visualSet: BuildingVisualSet, scene: Phaser.Scene, progress: number, completed: boolean, x: number, y: number, depth: number, alpha: number): BuildingVisualSet {
  const next = rebuildBuildingVisuals(visualSet, scene, progress, completed, x, y, alpha, depth);
  next.root.setPosition(x, y).setDepth(depth).setAlpha(alpha);
  return next;
}
