import Phaser from 'phaser';
import type { Building } from '../economy/productionTypes';
import type { UnitKind } from '../units/unitTypes';
import type { ActionIconKind, CommandAction } from './actionIcons';

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
  actions?: CommandAction[];
  onAction?: (action: CommandAction) => void;
};

export class PortraitPanel {
  private graphics: Phaser.GameObjects.Graphics;
  private texts: Phaser.GameObjects.Text[] = [];
  private hoveredAction: CommandAction | null = null;
  private actionRects: { rect: Phaser.Geom.Rectangle; action: CommandAction }[] = [];
  private onAction?: (action: CommandAction) => void;
  private isPointerDownOnAction = false;

  constructor(private scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(3300);
    scene.input.on('pointermove', this.handlePointerMove, this);
    scene.input.on('pointerdown', this.handlePointerDown, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
  }

  render(x: number, y: number, state: PortraitPanelState): void {
    const actions = state.actions ?? [];
    this.onAction = state.onAction;
    this.graphics.clear();
    this.clearTexts();
    this.actionRects = [];
    this.graphics.fillStyle(0x120b07, 0.96).fillRoundedRect(x, y, 620, 136, 10);
    this.graphics.lineStyle(3, 0x8b6f3e, 1).strokeRoundedRect(x, y, 620, 136, 10);

    if (state.portraits.length === 0) {
      this.renderEmpty(x, y, state.placementLabel);
      this.renderActions(x + 314, y + 18, actions);
      this.updateHoveredActionFromPointer(this.scene.input.activePointer);
      this.renderActionInfo(x + 468, y + 18, state.placementLabel);
      return;
    }

    if (state.portraits.length === 1) this.renderLargePortrait(x + 14, y + 12, state.portraits[0]);
    else this.renderPortraitStrip(x + 14, y + 14, state.portraits);

    this.renderActions(x + 314, y + 18, actions);
    this.updateHoveredActionFromPointer(this.scene.input.activePointer);
    this.renderActionInfo(x + 468, y + 18, state.placementLabel);
  }

  private renderActionInfo(x: number, y: number, placementLabel: string | null): void {
    this.graphics.fillStyle(0x08090d, 0.9).fillRoundedRect(x, y, 138, 100, 8);
    this.graphics.lineStyle(1, 0x49634c, 0.8).strokeRoundedRect(x, y, 138, 100, 8);
    if (this.hoveredAction) {
      this.addText(x + 8, y + 8, `${this.hoveredAction.label} (${this.hoveredAction.hotkey})`, '13px', '#f5e6b8');
      this.addText(x + 8, y + 30, this.hoveredAction.description, '11px', '#cbd5e1', 0, 122);
      return;
    }
    this.addText(x + 8, y + 8, 'Наведи на иконку', '12px', '#f5e6b8');
    this.addText(x + 8, y + 30, placementLabel ? `Сейчас: ${placementLabel}` : 'Здесь появится описание команды и горячая клавиша.', '11px', '#94a3b8', 0, 122);
  }

  private renderEmpty(x: number, y: number, placementLabel: string | null): void {
    this.addText(x + 20, y + 22, 'Нет выбранного объекта', '18px', '#f5e6b8');
    this.addText(x + 20, y + 54, 'Выбери юнит, отряд или здание.', '13px', '#cbd5e1');
    this.addText(x + 20, y + 84, placementLabel ? `Размещение: ${placementLabel}` : 'Команды появятся после выбора.', '13px', '#facc15');
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
    items.slice(0, 3).forEach((item, index) => {
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

  private renderActions(x: number, y: number, actions: CommandAction[]): void {
    const size = 42;
    const gap = 8;
    actions.slice(0, 9).forEach((action, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const ax = x + col * (size + gap);
      const ay = y + row * (size + gap);
      this.actionRects.push({ rect: new Phaser.Geom.Rectangle(ax, ay, size, size), action });
      this.graphics.fillStyle(0x08090d, 1).fillRect(ax, ay, size, size);
      this.graphics.lineStyle(2, this.hoveredAction?.id === action.id ? 0xfacc15 : 0x49634c, 1).strokeRect(ax, ay, size, size);
      this.drawActionIcon(ax + size / 2, ay + size / 2, action.icon);
      this.addText(ax + 4, ay + 2, action.hotkey, '10px', '#facc15');
    });
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void { this.updateHoveredActionFromPointer(pointer); }
  private handlePointerDown(pointer: Phaser.Input.Pointer): void { const action = this.getActionAtPointer(pointer); this.isPointerDownOnAction = Boolean(action); if (action) this.hoveredAction = action; }
  private handlePointerUp(pointer: Phaser.Input.Pointer): void { const action = this.getActionAtPointer(pointer); if (this.isPointerDownOnAction && action) this.onAction?.(action); this.isPointerDownOnAction = false; }
  private updateHoveredActionFromPointer(pointer: Phaser.Input.Pointer): void { this.hoveredAction = this.getActionAtPointer(pointer); }
  private getActionAtPointer(pointer: Phaser.Input.Pointer): CommandAction | null { return this.actionRects.find(({ rect }) => Phaser.Geom.Rectangle.Contains(rect, pointer.x, pointer.y))?.action ?? null; }

  private drawActionIcon(x: number, y: number, icon: ActionIconKind): void {
    this.graphics.lineStyle(3, 0xe5e7eb, 0.9);
    if (icon === 'house' || icon === 'barracks' || icon === 'stable' || icon === 'foundry') { const color = icon === 'foundry' ? 0x64748b : icon === 'stable' ? 0x92400e : icon === 'barracks' ? 0x78350f : 0x9a6b39; this.graphics.fillStyle(color, 1).fillRect(x - 12, y - 2, 24, 16); this.graphics.fillStyle(0x3a2413, 1).fillTriangle(x - 16, y - 2, x, y - 16, x + 16, y - 2); return; }
    if (icon === 'repair' || icon === 'hammer') { this.graphics.lineBetween(x - 12, y + 12, x + 10, y - 10); this.graphics.lineBetween(x + 5, y - 14, x + 15, y - 4); return; }
    if (icon === 'gather') { this.graphics.fillStyle(0x22c55e, 1).fillCircle(x - 7, y, 7); this.graphics.fillStyle(0x92400e, 1).fillRect(x + 4, y - 10, 7, 20); return; }
    if (icon === 'stop') { this.graphics.fillStyle(0xdc2626, 1).fillRect(x - 11, y - 11, 22, 22); return; }
    if (icon === 'attack') { this.graphics.lineBetween(x - 12, y + 12, x + 12, y - 12); this.graphics.lineBetween(x + 4, y - 12, x + 12, y - 12); this.graphics.lineBetween(x + 12, y - 12, x + 12, y - 4); return; }
    if (icon === 'hold') { this.graphics.fillStyle(0x94a3b8, 1).fillTriangle(x, y - 15, x + 14, y + 10, x - 14, y + 10); return; }
    if (icon === 'worker' || icon === 'soldier' || icon === 'specialist' || icon === 'cavalry' || icon === 'artillery') { const color = icon === 'worker' ? 0x22c55e : icon === 'soldier' ? 0x2563eb : icon === 'specialist' ? 0xa855f7 : icon === 'cavalry' ? 0xf59e0b : 0x64748b; this.graphics.fillStyle(color, 1).fillCircle(x, y - 7, 6); this.graphics.fillRoundedRect(x - 9, y, 18, 17, 4); }
  }

  private drawDummyPortrait(x: number, y: number, color: number, kind: UnitKind | 'building', scale: number): void {
    if (kind === 'building') { this.graphics.fillStyle(color, 1).fillRect(x - 18 * scale, y - 4 * scale, 36 * scale, 28 * scale); this.graphics.fillStyle(0x3a2413, 1).fillTriangle(x - 24 * scale, y - 4 * scale, x, y - 28 * scale, x + 24 * scale, y - 4 * scale); this.graphics.lineStyle(2, 0xf5e6b8, 0.8).strokeRect(x - 18 * scale, y - 4 * scale, 36 * scale, 28 * scale); return; }
    this.graphics.fillStyle(color, 1).fillCircle(x, y - 20 * scale, 10 * scale); this.graphics.fillRoundedRect(x - 16 * scale, y - 8 * scale, 32 * scale, 34 * scale, 7 * scale); this.graphics.lineStyle(3, 0xe5e7eb, 0.9);
    if (kind === 'worker') this.graphics.lineBetween(x - 24 * scale, y - 32 * scale, x + 14 * scale, y + 2 * scale);
    if (kind === 'soldier') this.graphics.lineBetween(x + 18 * scale, y - 26 * scale, x + 18 * scale, y + 26 * scale);
    if (kind === 'specialist') this.graphics.strokeCircle(x, y - 20 * scale, 17 * scale);
    if (kind === 'cavalry') this.graphics.strokeEllipse(x, y + 8 * scale, 46 * scale, 22 * scale);
    if (kind === 'artillery') { this.graphics.strokeCircle(x - 16 * scale, y + 20 * scale, 7 * scale); this.graphics.strokeCircle(x + 16 * scale, y + 20 * scale, 7 * scale); this.graphics.lineBetween(x - 18 * scale, y, x + 26 * scale, y - 16 * scale); }
  }

  private drawBar(x: number, y: number, width: number, height: number, value: number, color: number): void { this.graphics.fillStyle(0x0f172a, 1).fillRect(x, y, width, height); this.graphics.fillStyle(color, 1).fillRect(x, y, Math.max(0, Math.min(1, value)) * width, height); }

  private addText(x: number, y: number, text: string, fontSize: string, color: string, originX = 0, wrapWidth?: number): void { const style: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Arial', fontSize, color }; if (wrapWidth) style.wordWrap = { width: wrapWidth }; const item = this.scene.add.text(x, y, text, style).setScrollFactor(0).setDepth(3400); item.setOrigin(originX, 0); this.texts.push(item); }
  private clearTexts(): void { this.texts.forEach((text) => text.destroy()); this.texts = []; }
}
