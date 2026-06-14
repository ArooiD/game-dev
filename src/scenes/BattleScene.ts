import Phaser from 'phaser';

type Formation = 'line' | 'column' | 'square' | 'wedge' | 'doubleLine' | 'skirmish';
type UnitKind = 'worker' | 'soldier' | 'specialist' | 'cavalry' | 'artillery';

type UnitSpec = {
  label: string;
  color: number;
  width: number;
  height: number;
  speed: number;
  hp: number;
  morale: number;
  ammo: number;
  range: number;
  damage: number;
  moraleDamage: number;
  reloadMs: number;
};

const UNIT_SPECS: Record<UnitKind, UnitSpec> = {
  worker: { label: 'Рабочий', color: 0x22c55e, width: 12, height: 12, speed: 52, hp: 70, morale: 70, ammo: 0, range: 0, damage: 4, moraleDamage: 2, reloadMs: 1000 },
  soldier: { label: 'Воин', color: 0x2563eb, width: 14, height: 14, speed: 58, hp: 100, morale: 100, ammo: 12, range: 240, damage: 24, moraleDamage: 12, reloadMs: 1400 },
  specialist: { label: 'Специалист', color: 0xa855f7, width: 13, height: 13, speed: 62, hp: 85, morale: 120, ammo: 18, range: 280, damage: 18, moraleDamage: 20, reloadMs: 1100 },
  cavalry: { label: 'Кавалерия', color: 0xf59e0b, width: 20, height: 12, speed: 105, hp: 130, morale: 115, ammo: 6, range: 120, damage: 32, moraleDamage: 22, reloadMs: 1250 },
  artillery: { label: 'Артиллерия', color: 0x64748b, width: 24, height: 18, speed: 28, hp: 160, morale: 90, ammo: 8, range: 520, damage: 70, moraleDamage: 40, reloadMs: 3200 },
};

type Unit = {
  id: number;
  kind: UnitKind;
  battalionId: number | null;
  sprite: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  selected: boolean;
  target: Phaser.Math.Vector2 | null;
  speed: number;
  hp: number;
  morale: number;
  ammo: number;
  range: number;
  damage: number;
  moraleDamage: number;
  reloadMs: number;
  lastShotAt: number;
};

type Battalion = {
  id: number;
  name: string;
  unitIds: Set<number>;
  formation: Formation;
  angle: number;
};

export class BattleScene extends Phaser.Scene {
  private units: Unit[] = [];
  private enemies: Unit[] = [];
  private battalions: Battalion[] = [];
  private selectedIds = new Set<number>();
  private selectionStart: Phaser.Math.Vector2 | null = null;
  private rightDragStart: Phaser.Math.Vector2 | null = null;
  private selectionRect!: Phaser.GameObjects.Rectangle;
  private commandPreview!: Phaser.GameObjects.Graphics;
  private commandLines!: Phaser.GameObjects.Graphics;
  private battalionGraphics!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private nextId = 1;
  private nextBattalionId = 1;
  private formation: Formation = 'line';

  constructor() {
    super('BattleScene');
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, 3200, 2200);
    this.input.mouse?.disableContextMenu();

    this.drawTerrain();
    this.commandLines = this.add.graphics().setDepth(50);
    this.battalionGraphics = this.add.graphics().setDepth(60);
    this.commandPreview = this.add.graphics().setDepth(900);
    this.selectionRect = this.add.rectangle(0, 0, 1, 1, 0x84cc16, 0.15).setStrokeStyle(2, 0xa3e635).setVisible(false).setDepth(1000);
    this.hud = this.add.text(16, 16, '', { fontFamily: 'Arial', fontSize: '16px', color: '#e5e7eb', backgroundColor: '#111827cc', padding: { x: 12, y: 8 } }).setScrollFactor(0).setDepth(2000);

    this.spawnUnitBlock(360, 460, 5, 2, 'worker', false, false);
    this.spawnUnitBlock(520, 600, 8, 5, 'soldier', false, true);
    this.spawnUnitBlock(420, 760, 4, 2, 'specialist', false, false);
    this.spawnUnitBlock(720, 760, 5, 2, 'cavalry', false, false);
    this.spawnUnitBlock(900, 620, 3, 1, 'artillery', false, false);

    this.spawnUnitBlock(1800, 850, 8, 5, 'soldier', true, false);
    this.spawnUnitBlock(2000, 1040, 4, 2, 'cavalry', true, false);
    this.spawnUnitBlock(2200, 920, 2, 1, 'artillery', true, false);

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.keyboard?.on('keydown-ONE', () => this.setFormation('line'));
    this.input.keyboard?.on('keydown-TWO', () => this.setFormation('column'));
    this.input.keyboard?.on('keydown-THREE', () => this.setFormation('square'));
    this.input.keyboard?.on('keydown-FOUR', () => this.setFormation('wedge'));
    this.input.keyboard?.on('keydown-FIVE', () => this.setFormation('doubleLine'));
    this.input.keyboard?.on('keydown-SIX', () => this.setFormation('skirmish'));
    this.input.keyboard?.on('keydown-G', () => this.createBattalionFromSelection());
    this.input.keyboard?.on('keydown-U', () => this.ungroupSelectedBattalions());
    this.input.keyboard?.on('keydown-R', () => this.reformSelectedInPlace());
    this.input.keyboard?.on('keydown-ESC', () => this.clearSelection());
  }

  update(time: number, delta: number): void {
    this.updateCamera(delta);
    this.updateUnits(this.units, delta);
    this.updateUnits(this.enemies, delta);
    this.updateCombat(time);
    this.renderUnitState();
    this.renderBattalions();
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

  private spawnUnitBlock(x: number, y: number, cols: number, rows: number, kind: UnitKind, enemy: boolean, autoBattalion: boolean): void {
    const battalionId = !enemy && autoBattalion ? this.nextBattalionId++ : null;
    const unitIds = new Set<number>();
    const spec = UNIT_SPECS[kind];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const unit = this.createUnit(x + c * 28, y + r * 28, kind, enemy, battalionId);
        if (!enemy) unitIds.add(unit.id);
      }
    }
    if (!enemy && battalionId !== null) this.battalions.push({ id: battalionId, name: `${spec.label} ${battalionId}`, unitIds, formation: 'line', angle: 0 });
  }

  private createUnit(x: number, y: number, kind: UnitKind, enemy: boolean, battalionId: number | null): Unit {
    const spec = UNIT_SPECS[kind];
    const color = enemy ? 0xdc2626 : spec.color;
    const sprite = this.add.rectangle(x, y, spec.width, spec.height, color).setStrokeStyle(1, 0x111827);
    const marker = kind === 'worker' ? 'W' : kind === 'soldier' ? 'S' : kind === 'specialist' ? 'P' : kind === 'cavalry' ? 'C' : 'A';
    const label = this.add.text(x, y - 16, marker, { fontFamily: 'Arial', fontSize: '10px', color: '#e5e7eb' }).setOrigin(0.5).setDepth(20);
    const unit: Unit = {
      id: this.nextId++, kind, battalionId, sprite, label, selected: false, target: null,
      speed: enemy ? spec.speed * 0.85 : spec.speed, hp: spec.hp, morale: spec.morale, ammo: spec.ammo,
      range: spec.range, damage: spec.damage, moraleDamage: spec.moraleDamage, reloadMs: spec.reloadMs, lastShotAt: 0,
    };
    (enemy ? this.enemies : this.units).push(unit);
    return unit;
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
    this.expandSelectionToBattalions();
    this.selectionStart = null;
    this.selectionRect.setVisible(false);
  }

  private setFormation(formation: Formation): void {
    this.formation = formation;
    this.getSelectedBattalions().forEach((b) => b.formation = formation);
  }

  private issueMoveCommand(x: number, y: number, angle: number): void {
    const selected = this.units.filter((u) => this.selectedIds.has(u.id));
    const battalions = this.getSelectedBattalions();
    const groupedIds = new Set<number>();
    battalions.forEach((b) => b.unitIds.forEach((id) => groupedIds.add(id)));

    if (battalions.length > 0) {
      const groupOffsets = this.getGroupOffsets(battalions.length, angle);
      battalions.forEach((b, index) => {
        b.angle = angle;
        b.formation = this.formation;
        const members = this.units.filter((u) => b.unitIds.has(u.id));
        const base = groupOffsets[index] ?? new Phaser.Math.Vector2(0, 0);
        const offsets = this.getFormationOffsets(members.length, angle, b.formation);
        members.forEach((unit, unitIndex) => {
          const offset = offsets[unitIndex] ?? new Phaser.Math.Vector2(0, 0);
          unit.target = new Phaser.Math.Vector2(x + base.x + offset.x, y + base.y + offset.y);
        });
      });
    }

    const loose = selected.filter((u) => !groupedIds.has(u.id));
    const looseOffsets = this.getFormationOffsets(loose.length, angle, this.formation);
    loose.forEach((unit, index) => {
      const offset = looseOffsets[index] ?? new Phaser.Math.Vector2(0, 0);
      unit.target = new Phaser.Math.Vector2(x + offset.x, y + offset.y);
    });

    this.commandLines.clear();
    this.drawFormationGhost(this.commandLines, x, y, angle, selected.length, 0xfacc15, 0.65, this.formation);
  }

  private getGroupOffsets(count: number, angle: number): Phaser.Math.Vector2[] {
    const raw: Phaser.Math.Vector2[] = [];
    const spacing = 180;
    for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i - (count - 1) / 2) * spacing, 0));
    return raw.map((v) => this.rotate(v, angle));
  }

  private getFormationOffsets(count: number, angle: number, formation = this.formation): Phaser.Math.Vector2[] {
    const raw: Phaser.Math.Vector2[] = [];
    const gap = formation === 'skirmish' ? 34 : 22;
    if (formation === 'column') {
      for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % 4) * gap - 1.5 * gap, Math.floor(i / 4) * gap));
    } else if (formation === 'square') {
      const side = Math.ceil(Math.sqrt(count));
      for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % side) * gap - (side - 1) * gap / 2, Math.floor(i / side) * gap - (side - 1) * gap / 2));
    } else if (formation === 'wedge') {
      let placed = 0;
      for (let row = 0; placed < count; row++) {
        const rowCount = row * 2 + 1;
        for (let col = 0; col < rowCount && placed < count; col++) {
          raw.push(new Phaser.Math.Vector2((col - row) * gap, row * gap));
          placed++;
        }
      }
    } else if (formation === 'doubleLine') {
      const width = Math.ceil(count / 2);
      for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % width) * gap - (width - 1) * gap / 2, Math.floor(i / width) * gap));
    } else {
      const width = formation === 'skirmish' ? Math.min(16, Math.max(1, count)) : Math.min(12, Math.max(1, count));
      for (let i = 0; i < count; i++) raw.push(new Phaser.Math.Vector2((i % width) * gap - (width - 1) * gap / 2, Math.floor(i / width) * gap));
    }
    return raw.map((v) => this.rotate(v, angle));
  }

  private rotate(v: Phaser.Math.Vector2, angle: number): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(v.x * Math.cos(angle) - v.y * Math.sin(angle), v.x * Math.sin(angle) + v.y * Math.cos(angle));
  }

  private drawCommandPreview(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2): void {
    const count = this.selectedIds.size;
    const angle = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y) > 12 ? Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y) : 0;
    this.commandPreview.clear();
    this.commandPreview.lineStyle(2, 0xfacc15, 0.85).lineBetween(start.x, start.y, end.x, end.y).strokeCircle(start.x, start.y, 10);
    this.drawFormationGhost(this.commandPreview, start.x, start.y, angle, count, 0xfacc15, 0.35, this.formation);
  }

  private drawFormationGhost(g: Phaser.GameObjects.Graphics, x: number, y: number, angle: number, count: number, color: number, alpha: number, formation: Formation): void {
    const offsets = this.getFormationOffsets(count, angle, formation);
    g.lineStyle(1, color, alpha);
    offsets.forEach((offset) => g.strokeRect(x + offset.x - 7, y + offset.y - 7, 14, 14));
  }

  private createBattalionFromSelection(): void {
    const selected = this.units.filter((u) => this.selectedIds.has(u.id));
    if (selected.length === 0) return;
    const id = this.nextBattalionId++;
    const unitIds = new Set(selected.map((u) => u.id));
    selected.forEach((u) => u.battalionId = id);
    this.battalions = this.battalions.filter((b) => [...b.unitIds].every((unitId) => !unitIds.has(unitId)));
    this.battalions.push({ id, name: `Отряд ${id}`, unitIds, formation: this.formation, angle: 0 });
  }

  private ungroupSelectedBattalions(): void {
    const selectedBattalionIds = new Set(this.getSelectedBattalions().map((b) => b.id));
    if (selectedBattalionIds.size === 0) return;
    this.units.forEach((u) => { if (u.battalionId && selectedBattalionIds.has(u.battalionId)) u.battalionId = null; });
    this.battalions = this.battalions.filter((b) => !selectedBattalionIds.has(b.id));
  }

  private reformSelectedInPlace(): void {
    const selected = this.units.filter((u) => this.selectedIds.has(u.id));
    if (selected.length === 0) return;
    const center = selected.reduce((acc, u) => acc.add(new Phaser.Math.Vector2(u.sprite.x, u.sprite.y)), new Phaser.Math.Vector2(0, 0)).scale(1 / selected.length);
    this.issueMoveCommand(center.x, center.y, this.getSelectedBattalions()[0]?.angle ?? 0);
  }

  private expandSelectionToBattalions(): void {
    const touchedBattalionIds = new Set(this.units.filter((u) => this.selectedIds.has(u.id) && u.battalionId !== null).map((u) => u.battalionId as number));
    this.units.forEach((unit) => {
      if (unit.battalionId !== null && touchedBattalionIds.has(unit.battalionId)) {
        unit.selected = true;
        this.selectedIds.add(unit.id);
      }
    });
  }

  private getSelectedBattalions(): Battalion[] {
    return this.battalions.filter((b) => [...b.unitIds].some((id) => this.selectedIds.has(id)));
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
      unit.label.setPosition(unit.sprite.x, unit.sprite.y - 16);
    }
  }

  private updateCombat(time: number): void {
    for (const unit of this.units) {
      if (unit.range <= 0) continue;
      const target = this.findNearest(unit, this.enemies, unit.range);
      if (target && unit.ammo > 0 && time - unit.lastShotAt > unit.reloadMs) this.fire(unit, target, time);
    }
    for (const unit of this.enemies) {
      if (unit.range <= 0) continue;
      const target = this.findNearest(unit, this.units, unit.range);
      if (target && unit.ammo > 0 && time - unit.lastShotAt > unit.reloadMs) this.fire(unit, target, time);
    }
    this.units = this.units.filter((u) => u.hp > 0 && u.morale > 0);
    this.enemies = this.enemies.filter((u) => u.hp > 0 && u.morale > 0);
    this.battalions.forEach((b) => b.unitIds = new Set([...b.unitIds].filter((id) => this.units.some((u) => u.id === id))));
    this.battalions = this.battalions.filter((b) => b.unitIds.size > 0);
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
    target.hp -= unit.damage;
    target.morale -= unit.moraleDamage;
    const color = unit.kind === 'artillery' ? 0xfb923c : unit.kind === 'specialist' ? 0xc084fc : 0xfef08a;
    const shot = this.add.line(0, 0, unit.sprite.x, unit.sprite.y, target.sprite.x, target.sprite.y, color, 0.8).setOrigin(0).setDepth(40);
    if (unit.kind === 'artillery') this.applySplashDamage(target, 54, unit.damage * 0.45, unit.moraleDamage * 0.5);
    this.time.delayedCall(unit.kind === 'artillery' ? 160 : 90, () => shot.destroy());
    if (target.hp <= 0 || target.morale <= 0) this.destroyUnit(target);
  }

  private applySplashDamage(center: Unit, radius: number, damage: number, moraleDamage: number): void {
    const pool = this.units.includes(center) ? this.units : this.enemies;
    pool.forEach((target) => {
      if (target.id === center.id) return;
      const dist = Phaser.Math.Distance.Between(center.sprite.x, center.sprite.y, target.sprite.x, target.sprite.y);
      if (dist <= radius) {
        target.hp -= damage;
        target.morale -= moraleDamage;
        if (target.hp <= 0 || target.morale <= 0) this.destroyUnit(target);
      }
    });
  }

  private destroyUnit(unit: Unit): void {
    unit.sprite.destroy();
    unit.label.destroy();
  }

  private renderUnitState(): void {
    for (const unit of [...this.units, ...this.enemies]) {
      unit.sprite.setStrokeStyle(unit.selected ? 3 : 1, unit.selected ? 0xfacc15 : 0x111827);
      unit.sprite.setAlpha(Math.max(0.25, unit.morale / UNIT_SPECS[unit.kind].morale));
      unit.label.setPosition(unit.sprite.x, unit.sprite.y - 16);
      unit.label.setVisible(unit.selected || unit.kind === 'artillery' || unit.kind === 'cavalry');
    }
  }

  private renderBattalions(): void {
    this.battalionGraphics.clear();
    this.getSelectedBattalions().forEach((b) => {
      const members = this.units.filter((u) => b.unitIds.has(u.id));
      if (members.length === 0) return;
      const minX = Math.min(...members.map((u) => u.sprite.x));
      const maxX = Math.max(...members.map((u) => u.sprite.x));
      const minY = Math.min(...members.map((u) => u.sprite.y));
      const maxY = Math.max(...members.map((u) => u.sprite.y));
      this.battalionGraphics.lineStyle(2, 0x38bdf8, 0.75).strokeRect(minX - 16, minY - 16, maxX - minX + 32, maxY - minY + 32);
    });
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
    const battalions = this.getSelectedBattalions();
    const selected = this.units.filter((u) => this.selectedIds.has(u.id));
    const kindCounts = selected.reduce<Record<UnitKind, number>>((acc, u) => {
      acc[u.kind] += 1;
      return acc;
    }, { worker: 0, soldier: 0, specialist: 0, cavalry: 0, artillery: 0 });
    this.hud.setText([
      'Historical RTS MVP',
      `Selected units: ${this.selectedIds.size} | battalions: ${battalions.length}`,
      `Selected: W ${kindCounts.worker}, S ${kindCounts.soldier}, P ${kindCounts.specialist}, C ${kindCounts.cavalry}, A ${kindCounts.artillery}`,
      `Formation: ${this.formation} (1 line, 2 column, 3 square, 4 wedge, 5 double, 6 skirmish)`,
      `Blue: ${this.units.length} | Red: ${this.enemies.length} | Own battalions: ${this.battalions.length}`,
      'G: group selection | U: ungroup | R: reform in place',
      'LMB drag: select | RMB drag: move + face direction | WASD: camera | ESC: clear',
    ]);
  }
}
