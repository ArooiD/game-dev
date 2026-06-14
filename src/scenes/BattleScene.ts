import Phaser from 'phaser';

type Formation = 'line' | 'column' | 'square';

type Unit = {
  id: number;
  sprite: Phaser.GameObjects.Rectangle;
  selected: boolean;
  target: Phaser.Math.Vector2 | null;
  speed: number;
  hp: number;
  morale: number;
  ammo: number;
  reloadMs: number;
  lastShotAt: number;
};

export class BattleScene extends Phaser.Scene {
  private units: Unit[] = [];
  private enemies: Unit[] = [];
  private selectedIds = new Set<number>();
  private selectionStart: Phaser.Math.Vector2 | null = null;
  private rightDragStart: Phaser.Math.Vector2 | null = null;
  private selectionRect!: Phaser.GameObjects.Rectangle;
  private commandPreview!: Phaser.GameObjects.Graphics;
  private commandLines!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private nextId = 1;
  private formation: Formation = 'line';

  constructor() {
    super('BattleScene');
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, 3200, 2200);
    this.input.mouse?.disableContextMenu();

    this.drawTerrain();
    this.commandLines = this.add.graphics().setDepth(50);
    this.commandPreview = this.add.graphics().setDepth(900);
    this.selectionRect = this.add.rectangle(0, 0, 1, 1, 0x84cc16, 0.15).setStrokeStyle(2, 0xa3e635).setVisible(false).setDepth(1000);
    this.hud = this.add.text(16, 16, '', { fontFamily: 'Arial', fontSize: '16px', color: '#e5e7eb', backgroundColor: '#111827cc', padding: { x: 12, y: 8 } }).setScrollFactor(0).setDepth(2000);

    this.spawnBattalion(500, 600, 8, 5, false);
    this.spawnBattalion(1800, 850, 8, 5, true);

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.keyboard?.on('keydown-ONE', () => this.formation = 'line');
    this.input.keyboard?.on('keydown-TWO', () => this.formation = 'column');
    this.input.keyboard?.on('keydown-THREE', () => this.formation = 'square');
    this.input.keyboard?.on('keydown-ESC', () => this.clearSelection());
  }

  update(time: number, delta: number): void {
    this.updateCamera(delta);
    this.updateUnits(this.units, delta);
    this.updateUnits(this.enemies, delta);
    this.updateCombat(time);
    this.renderUnitState();
    this.updateHud();
  }

  private drawTerrain(): void {
    const g = this.add.graphics();
    g.fillStyle(0x334155, 1).fillRect(0, 0, 3200, 2200);
    for (let x = 0; x < 3200; x += 80) g.lineStyle(1, 0x475569, 0.25).lineBetween(x, 0, x, 2200);
    for (let y = 0; y < 2200; y += 80) g.lineStyle(1, 0x475569, 0.25).lineBetween(0, y, 3200, y);
    g.fillStyle(0x1f7a3a, 0.4).fillEllipse(900, 420, 520, 260);
    g.fillStyle(0x64748b, 0.5).fillEllipse(2200, 1450, 620, 340);
  }

  private spawnBattalion(x: number, y: number, cols: number, rows: number, enemy: boolean): void {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sprite = this.add.rectangle(x + c * 24, y + r * 24, 14, 14, enemy ? 0xdc2626 : 0x2563eb).setStrokeStyle(1, 0x111827);
        const unit: Unit = { id: this.nextId++, sprite, selected: false, target: null, speed: enemy ? 42 : 58, hp: 100, morale: 100, ammo: 12, reloadMs: 1400, lastShotAt: 0 };
        (enemy ? this.enemies : this.units).push(unit);
      }
    }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    const world = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    if (pointer.rightButtonDown()) {
      this.rightDragStart = world.clone();
      this.drawCommandPreview(world, world);
      return;
    }
    this.selectionStart = world.clone();
    this.selectionRect.setPosition(world.x, world.y).setSize(1, 1).setVisible(true);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    const world = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    if (this.rightDragStart && pointer.rightButtonDown()) {
      this.drawCommandPreview(this.rightDragStart, world);
      return;
    }
    if (!this.selectionStart || !pointer.isDown) return;
    const x = Math.min(this.selectionStart.x, world.x);
    const y = Math.min(this.selectionStart.y, world.y);
    const w = Math.abs(world.x - this.selectionStart.x);
    const h = Math.abs(world.y - this.selectionStart.y);
    this.selectionRect.setPosition(x + w / 2, y + h / 2).setSize(w, h);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    const world = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    if (this.rightDragStart && pointer.rightButtonReleased()) {
      const dragDistance = Phaser.Math.Distance.Between(this.rightDragStart.x, this.rightDragStart.y, world.x, world.y);
      const angle = dragDistance > 12 ? Phaser.Math.Angle.Between(this.rightDragStart.x, this.rightDragStart.y, world.x, world.y) : 0;
      this.issueMoveCommand(this.rightDragStart.x, this.rightDragStart.y, angle);
      this.rightDragStart = null;
      this.commandPreview.clear();
      return;
    }

    if (!this.selectionStart || pointer.rightButtonReleased()) return;
    const bounds = new Phaser.Geom.Rectangle(Math.min(this.selectionStart.x, world.x), Math.min(this.selectionStart.y, world.y), Math.abs(world.x - this.selectionStart.x), Math.abs(world.y - this.selectionStart.y));
    this.clearSelection();
    this.units.forEach((unit) => {
      if (Phaser.Geom.Rectangle.Contains(bounds, unit.sprite.x, unit.sprite.y) || Phaser.Math.Distance.Between(unit.sprite.x, unit.sprite.y, this.selectionStart!.x, this.selectionStart!.y) < 18) {
        unit.selected = true;
        this.selectedIds.add(unit.id);
      }
    });
    this.selectionStart = null;
    this.selectionRect.setVisible(false);
  }

  private issueMoveCommand(x: number, y: number, angle: number): void {
    const selected = this.units.filter((u) => this.selectedIds.has(u.id));
    const offsets = this.getFormationOffsets(selected.length, angle);
    selected.forEach((unit, index) => {
      const offset = offsets[index] ?? new Phaser.Math.Vector2(0, 0);
      unit.target = new Phaser.Math.Vector2(x + offset.x, y + offset.y);
    });
    this.commandLines.clear();
    this.drawFormationGhost(this.commandLines, x, y, angle, selected.length, 0xfacc15, 0.65);
  }

  private getFormationOffsets(count: number, angle: number): Phaser.Math.Vector2[] {
    const raw: Phaser.Math.Vector2[] = [];
    if (this.formation === 'column') {
      for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % 4) * 22 - 33, Math.floor(i / 4) * 22));
    } else if (this.formation === 'square') {
      const side = Math.ceil(Math.sqrt(count));
      for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % side) * 22 - (side - 1) * 11, Math.floor(i / side) * 22 - (side - 1) * 11));
    } else {
      const width = Math.min(12, Math.max(1, count));
      for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % width) * 22 - (width - 1) * 11, Math.floor(i / width) * 22));
    }
    return raw.map((v) => new Phaser.Math.Vector2(v.x * Math.cos(angle) - v.y * Math.sin(angle), v.x * Math.sin(angle) + v.y * Math.cos(angle)));
  }

  private drawCommandPreview(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2): void {
    const count = this.selectedIds.size;
    const angle = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y) > 12 ? Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y) : 0;
    this.commandPreview.clear();
    this.commandPreview.lineStyle(2, 0xfacc15, 0.85).lineBetween(start.x, start.y, end.x, end.y).strokeCircle(start.x, start.y, 10);
    this.drawFormationGhost(this.commandPreview, start.x, start.y, angle, count, 0xfacc15, 0.35);
  }

  private drawFormationGhost(g: Phaser.GameObjects.Graphics, x: number, y: number, angle: number, count: number, color: number, alpha: number): void {
    const offsets = this.getFormationOffsets(count, angle);
    g.lineStyle(1, color, alpha);
    g.fillStyle(color, alpha);
    offsets.forEach((offset) => g.strokeRect(x + offset.x - 7, y + offset.y - 7, 14, 14));
  }

  private updateUnits(units: Unit[], delta: number): void {
    for (const unit of units) {
      if (!unit.target) continue;
      const dist = Phaser.Math.Distance.Between(unit.sprite.x, unit.sprite.y, unit.target.x, unit.target.y);
      if (dist < 3) {
        unit.target = null;
        continue;
      }
      const step = unit.speed * delta / 1000;
      const angle = Phaser.Math.Angle.Between(unit.sprite.x, unit.sprite.y, unit.target.x, unit.target.y);
      unit.sprite.x += Math.cos(angle) * Math.min(step, dist);
      unit.sprite.y += Math.sin(angle) * Math.min(step, dist);
    }
  }

  private updateCombat(time: number): void {
    for (const unit of this.units) {
      const target = this.findNearest(unit, this.enemies, 240);
      if (target && unit.ammo > 0 && time - unit.lastShotAt > unit.reloadMs) this.fire(unit, target, time);
    }
    for (const unit of this.enemies) {
      const target = this.findNearest(unit, this.units, 220);
      if (target && unit.ammo > 0 && time - unit.lastShotAt > unit.reloadMs) this.fire(unit, target, time);
    }
    this.units = this.units.filter((u) => u.hp > 0 && u.morale > 0);
    this.enemies = this.enemies.filter((u) => u.hp > 0 && u.morale > 0);
  }

  private findNearest(unit: Unit, targets: Unit[], range: number): Unit | null {
    let best: Unit | null = null;
    let bestDist = range;
    for (const target of targets) {
      const dist = Phaser.Math.Distance.Between(unit.sprite.x, unit.sprite.y, target.sprite.x, target.sprite.y);
      if (dist < bestDist) { best = target; bestDist = dist; }
    }
    return best;
  }

  private fire(unit: Unit, target: Unit, time: number): void {
    unit.lastShotAt = time;
    unit.ammo -= 1;
    target.hp -= 24;
    target.morale -= 12;
    const shot = this.add.line(0, 0, unit.sprite.x, unit.sprite.y, target.sprite.x, target.sprite.y, 0xfef08a, 0.8).setOrigin(0).setDepth(40);
    this.time.delayedCall(90, () => shot.destroy());
    if (target.hp <= 0 || target.morale <= 0) target.sprite.destroy();
  }

  private renderUnitState(): void {
    for (const unit of [...this.units, ...this.enemies]) {
      unit.sprite.setStrokeStyle(unit.selected ? 3 : 1, unit.selected ? 0xfacc15 : 0x111827);
      unit.sprite.setAlpha(Math.max(0.25, unit.morale / 100));
    }
  }

  private updateCamera(delta: number): void {
    const keys = this.input.keyboard?.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key> | undefined;
    if (!keys) return;
    const cam = this.cameras.main;
    const speed = 420 * delta / 1000;
    if (keys.A.isDown) cam.scrollX -= speed;
    if (keys.D.isDown) cam.scrollX += speed;
    if (keys.W.isDown) cam.scrollY -= speed;
    if (keys.S.isDown) cam.scrollY += speed;
  }

  private clearSelection(): void {
    this.selectedIds.clear();
    this.units.forEach((unit) => unit.selected = false);
  }

  private updateHud(): void {
    this.hud.setText([
      'Historical RTS MVP',
      `Selected: ${this.selectedIds.size}`,
      `Formation: ${this.formation} (1 line, 2 column, 3 square)`,
      `Blue: ${this.units.length} | Red: ${this.enemies.length}`,
      'LMB drag: select | RMB click/drag: move + face direction | WASD: camera | ESC: clear',
    ]);
  }
}
