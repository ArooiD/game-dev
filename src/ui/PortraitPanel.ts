import Phaser from 'phaser';
import { BUILDING_SPECS } from '../economy/buildingTypes';
import type { Building } from '../economy/productionTypes';
import type { UnitKind } from '../units/unitTypes';

export type PortraitPanelUnit = {
  kind: UnitKind;
  label: string;
  short: string;
  color: number;
  count: number;
  total: number;
};

export type PortraitPanelState = {
  units: PortraitPanelUnit[];
  selectedBuilding: Building | null;
  selectedUnitCount: number;
  selectedBattalionCount: number;
  placementLabel: string | null;
};

export class PortraitPanel {
  private graphics: Phaser.GameObjects.Graphics;
  private texts: Phaser.GameObjects.Text[] = [];

  constructor(private scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(3300);
  }

  render(x: number, y: number, state: PortraitPanelState): void {
    this.graphics.clear();
    this.clearTexts();
    this.graphics.fillStyle(0x120b07, 0.96).fillRoundedRect(x, y, 560, 136, 10);
    this.graphics.lineStyle(3, 0x8b6f3e, 1).strokeRoundedRect(x, y, 560, 136, 10);

    if (state.selectedBuilding) {
      this.renderBuildingPortrait(x + 14, y + 14, state.selectedBuilding);
    } else {
      this.renderUnitPortraits(x + 14, y + 14, state.units);
    }

    const hint = state.selectedBuilding
      ? 'T рабочий | Q воин | E специалист | C кавалерия | A артиллерия'
      : 'H дом | B казармы | S конюшня | F литейная';
    this.addText(x + 192, y + 20, state.selectedBuilding ? BUILDING_SPECS[state.selectedBuilding.kind].label : 'Командная панель', '18px', '#f5e6b8');
    this.addText(x + 192, y + 48, hint, '13px', '#e5e7eb');
    this.addText(x + 192, y + 74, `Выбрано юнитов: ${state.selectedUnitCount} | Отрядов: ${state.selectedBattalionCount}`, '13px', '#cbd5e1');
    this.addText(x + 192, y + 100, state.placementLabel ? `Размещение: ${state.placementLabel}` : 'ЛКМ выбрать/строить | ПКМ движение | ESC отмена', '13px', '#facc15');
  }

  private renderUnitPortraits(x: number, y: number, units: PortraitPanelUnit[]): void {
    const cardW = 74;
    const overlap = 14;
    units.forEach((unit, index) => {
      const cardX = x + index * (cardW - overlap);
      const active = unit.count > 0;
      this.graphics.fillStyle(active ? 0x3a2615 : 0x20150d, 1).fillRoundedRect(cardX, y, cardW, 104, 8);
      this.graphics.lineStyle(active ? 3 : 1, active ? 0xfacc15 : 0x6b4f2a, 1).strokeRoundedRect(cardX, y, cardW, 104, 8);
      this.graphics.fillStyle(0x0f172a, 1).fillRoundedRect(cardX + 9, y + 8, 56, 56, 6);
      this.drawUnitBust(cardX + 37, y + 39, unit.color, unit.kind);
      this.addText(cardX + 37, y + 68, unit.label, '10px', '#f8fafc', 0.5);
      this.addText(cardX + 37, y + 84, `${unit.count}/${unit.total}`, '12px', active ? '#facc15' : '#cbd5e1', 0.5);
    });
  }

  private renderBuildingPortrait(x: number, y: number, building: Building): void {
    const spec = BUILDING_SPECS[building.kind];
    this.graphics.fillStyle(0x2b1c11, 1).fillRoundedRect(x, y, 160, 104, 8);
    this.graphics.lineStyle(3, building.selected ? 0xfacc15 : 0x8b6f3e, 1).strokeRoundedRect(x, y, 160, 104, 8);
    this.graphics.fillStyle(0x0f172a, 1).fillRoundedRect(x + 10, y + 10, 72, 72, 6);
    this.drawBuildingIcon(x + 46, y + 52, spec.color);
    this.addText(x + 92, y + 14, spec.label, '14px', '#f5e6b8');
    this.addText(x + 92, y + 38, building.completed ? 'Готово' : `Стройка ${Math.round(building.progressMs / building.buildTimeMs * 100)}%`, '12px', building.completed ? '#86efac' : '#facc15');
    this.addText(x + 92, y + 60, `Очередь: ${building.queue.length}`, '12px', '#cbd5e1');
  }

  private drawUnitBust(x: number, y: number, color: number, kind: UnitKind): void {
    this.graphics.fillStyle(color, 1).fillCircle(x, y - 14, 9);
    this.graphics.fillRoundedRect(x - 14, y - 4, 28, 26, 6);
    this.graphics.lineStyle(3, 0xe5e7eb, 0.85);
    if (kind === 'cavalry') this.graphics.strokeEllipse(x, y + 6, 38, 20);
    if (kind === 'artillery') {
      this.graphics.strokeCircle(x - 13, y + 16, 7);
      this.graphics.strokeCircle(x + 13, y + 16, 7);
      this.graphics.lineBetween(x - 18, y, x + 22, y - 12);
    }
    if (kind === 'specialist') this.graphics.strokeCircle(x, y - 14, 15);
    if (kind === 'worker') this.graphics.lineBetween(x - 18, y - 24, x + 10, y - 2);
  }

  private drawBuildingIcon(x: number, y: number, color: number): void {
    this.graphics.fillStyle(color, 1).fillRect(x - 24, y - 4, 48, 34);
    this.graphics.fillStyle(0x3a2413, 1).fillTriangle(x - 30, y - 4, x, y - 32, x + 30, y - 4);
    this.graphics.lineStyle(2, 0xf5e6b8, 0.7).strokeRect(x - 24, y - 4, 48, 34);
  }

  private addText(x: number, y: number, text: string, fontSize: string, color: string, originX = 0): void {
    const item = this.scene.add.text(x, y, text, { fontFamily: 'Arial', fontSize, color }).setScrollFactor(0).setDepth(3400);
    item.setOrigin(originX, 0);
    this.texts.push(item);
  }

  private clearTexts(): void {
    this.texts.forEach((text) => text.destroy());
    this.texts = [];
  }
}
