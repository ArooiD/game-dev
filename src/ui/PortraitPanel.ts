import Phaser from 'phaser';
import { BUILDING_SPECS } from '../economy/buildingTypes';
import type { Building } from '../economy/productionTypes';
import type { UnitKind } from '../units/unitTypes';

export type PortraitItem = {
  id: string;
  entityType: 'unit' | 'squad' | 'building';
  title: string;
  subtitle: string;
  kind: UnitKind | 'building';
  color: number;
  count: number;
  hpPercent: number;
  moralePercent?: number;
  queueCount?: number;
  progressPercent?: number;
};

export type PortraitPanelState = {
  portraits: PortraitItem[];
  selectedBuilding: Building | null;
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
    this.graphics.fillStyle(0x120b07, 0.96).fillRoundedRect(x, y, 620, 136, 10);
    this.graphics.lineStyle(3, 0x8b6f3e, 1).strokeRoundedRect(x, y, 620, 136, 10);

    if (state.portraits.length === 0) {
      this.renderEmpty(x, y, state.placementLabel);
      return;
    }

    if (state.portraits.length === 1) {
      this.renderLargePortrait(x + 14, y + 12, state.portraits[0]);
    } else {
      this.renderPortraitStrip(x + 14, y + 14, state.portraits);
    }

    const commandTitle = state.selectedBuilding ? 'Команды здания' : 'Команды выбора';
    const commandText = state.selectedBuilding
      ? 'T рабочий | Q воин | E специалист | C кавалерия | A артиллерия'
      : 'ПКМ движение/работа | 1-6 формации | G отряд | U распустить';
    this.addText(x + 270, y + 24, commandTitle, '18px', '#f5e6b8');
    this.addText(x + 270, y + 54, commandText, '13px', '#e5e7eb');
    this.addText(x + 270, y + 84, state.placementLabel ? `Размещение: ${state.placementLabel}` : 'Портрет раскрывается только при выборе юнита, отряда или здания', '13px', '#facc15');
  }

  private renderEmpty(x: number, y: number, placementLabel: string | null): void {
    this.addText(x + 20, y + 22, 'Нет выбранного объекта', '18px', '#f5e6b8');
    this.addText(x + 20, y + 54, 'Выбери одного юнита, отряд или здание, чтобы открыть портрет.', '13px', '#cbd5e1');
    this.addText(x + 20, y + 84, placementLabel ? `Размещение: ${placementLabel}` : 'H дом | B казармы | S конюшня | F литейная', '13px', '#facc15');
  }

  private renderLargePortrait(x: number, y: number, item: PortraitItem): void {
    this.graphics.fillStyle(0x2b1c11, 1).fillRoundedRect(x, y, 232, 112, 8);
    this.graphics.lineStyle(3, 0xfacc15, 1).strokeRoundedRect(x, y, 232, 112, 8);
    this.graphics.fillStyle(0x0f172a, 1).fillRoundedRect(x + 10, y + 10, 92, 92, 6);
    this.drawDummyPortrait(x + 56, y + 60, item.color, item.kind, 1.35);
    this.addText(x + 114, y + 12, item.title, '17px', '#f5e6b8');
    this.addText(x + 114, y + 38, item.subtitle, '12px', '#cbd5e1');
    this.drawBar(x + 114, y + 64, 96, 8, item.hpPercent, 0x22c55e);
    if (item.moralePercent !== undefined) this.drawBar(x + 114, y + 80, 96, 8, item.moralePercent, 0x38bdf8);
    const footer = item.entityType === 'building' ? `Очередь: ${item.queueCount ?? 0}` : `В группе: ${item.count}`;
    this.addText(x + 114, y + 92, footer, '12px', '#facc15');
  }

  private renderPortraitStrip(x: number, y: number, items: PortraitItem[]): void {
    const cardW = 112;
    const step = 86;
    items.slice(0, 6).forEach((item, index) => {
      const cardX = x + index * step;
      this.graphics.fillStyle(0x2b1c11, 1).fillRoundedRect(cardX, y, cardW, 108, 8);
      this.graphics.lineStyle(2, 0x8b6f3e, 1).strokeRoundedRect(cardX, y, cardW, 108, 8);
      this.graphics.fillStyle(0x0f172a, 1).fillRoundedRect(cardX + 8, y + 8, 60, 60, 6);
      this.drawDummyPortrait(cardX + 38, y + 44, item.color, item.kind, 0.9);
      this.addText(cardX + 76, y + 10, item.title, '11px', '#f5e6b8');
      this.addText(cardX + 76, y + 30, `x${item.count}`, '14px', '#facc15');
      this.drawBar(cardX + 10, y + 78, 86, 6, item.hpPercent, 0x22c55e);
      if (item.moralePercent !== undefined) this.drawBar(cardX + 10, y + 90, 86, 6, item.moralePercent, 0x38bdf8);
    });
  }

  private drawDummyPortrait(x: number, y: number, color: number, kind: UnitKind | 'building', scale: number): void {
    if (kind === 'building') {
      this.graphics.fillStyle(color, 1).fillRect(x - 18 * scale, y - 4 * scale, 36 * scale, 28 * scale);
      this.graphics.fillStyle(0x3a2413, 1).fillTriangle(x - 24 * scale, y - 4 * scale, x, y - 28 * scale, x + 24 * scale, y - 4 * scale);
      this.graphics.lineStyle(2, 0xf5e6b8, 0.8).strokeRect(x - 18 * scale, y - 4 * scale, 36 * scale, 28 * scale);
      return;
    }

    this.graphics.fillStyle(color, 1).fillCircle(x, y - 20 * scale, 10 * scale);
    this.graphics.fillRoundedRect(x - 16 * scale, y - 8 * scale, 32 * scale, 34 * scale, 7 * scale);
    this.graphics.lineStyle(3, 0xe5e7eb, 0.9);
    if (kind === 'worker') this.graphics.lineBetween(x - 24 * scale, y - 32 * scale, x + 14 * scale, y + 2 * scale);
    if (kind === 'soldier') this.graphics.lineBetween(x + 18 * scale, y - 26 * scale, x + 18 * scale, y + 26 * scale);
    if (kind === 'specialist') this.graphics.strokeCircle(x, y - 20 * scale, 17 * scale);
    if (kind === 'cavalry') this.graphics.strokeEllipse(x, y + 8 * scale, 46 * scale, 22 * scale);
    if (kind === 'artillery') {
      this.graphics.strokeCircle(x - 16 * scale, y + 20 * scale, 7 * scale);
      this.graphics.strokeCircle(x + 16 * scale, y + 20 * scale, 7 * scale);
      this.graphics.lineBetween(x - 18 * scale, y, x + 26 * scale, y - 16 * scale);
    }
  }

  private drawBar(x: number, y: number, width: number, height: number, value: number, color: number): void {
    this.graphics.fillStyle(0x0f172a, 1).fillRect(x, y, width, height);
    this.graphics.fillStyle(color, 1).fillRect(x, y, Math.max(0, Math.min(1, value)) * width, height);
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
