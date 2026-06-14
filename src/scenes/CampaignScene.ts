import Phaser from 'phaser';
import { europeCampaignState } from '../campaign/europeCampaign';
import type { CampaignArmy, CampaignState, Region } from '../campaign/types';

const OWNER_COLOR = {
  blue: 0x2563eb,
  red: 0xdc2626,
  neutral: 0x9ca3af,
};

export class CampaignScene extends Phaser.Scene {
  private state: CampaignState = structuredClone(europeCampaignState);
  private map!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private details!: Phaser.GameObjects.Text;

  constructor() {
    super('CampaignScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#101827');
    this.map = this.add.graphics();
    this.hud = this.add.text(16, 12, '', { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#f5e6b8', backgroundColor: '#2b1c11dd', padding: { x: 12, y: 8 } }).setDepth(10);
    this.details = this.add.text(16, 560, '', { fontFamily: 'Arial', fontSize: '15px', color: '#e5e7eb', backgroundColor: '#111827dd', padding: { x: 12, y: 10 } }).setDepth(10);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleClick(pointer.x, pointer.y));
    this.input.keyboard?.on('keydown-B', () => this.scene.start('BattleScene'));
    this.input.keyboard?.on('keydown-N', () => this.nextTurn());

    this.render();
  }

  private handleClick(x: number, y: number): void {
    const clickedArmy = this.findArmyAt(x, y);
    if (clickedArmy) {
      this.state.selectedArmyId = clickedArmy.id;
      this.state.selectedRegionId = clickedArmy.regionId;
      this.render();
      return;
    }

    const clickedRegion = this.findRegionAt(x, y);
    if (!clickedRegion) return;

    const selectedArmy = this.getSelectedArmy();
    if (selectedArmy && selectedArmy.regionId !== clickedRegion.id) {
      const from = this.getRegion(selectedArmy.regionId);
      if (from.neighbors.includes(clickedRegion.id)) {
        selectedArmy.regionId = clickedRegion.id;
        this.state.selectedRegionId = clickedRegion.id;
        if (clickedRegion.owner !== selectedArmy.faction) this.scene.start('BattleScene');
      }
    } else {
      this.state.selectedRegionId = clickedRegion.id;
      this.state.selectedArmyId = null;
    }

    this.render();
  }

  private nextTurn(): void {
    this.state.turn += 1;
    for (const region of this.state.regions) {
      if (region.owner === 'blue' || region.owner === 'red') {
        const res = this.state.resources[region.owner];
        res.food += region.income.food;
        res.wood += region.income.wood;
        res.iron += region.income.iron;
        res.gold += region.income.gold;
      }
    }
    this.render();
  }

  private render(): void {
    this.map.clear();
    this.drawEuropeBackdrop();
    this.drawConnections();
    this.drawRegions();
    this.drawArmies();
    this.updateHud();
  }

  private drawEuropeBackdrop(): void {
    this.map.fillStyle(0x26394d, 1).fillRect(0, 0, 1100, 720);
    this.map.fillStyle(0x344f3a, 0.95);
    this.map.fillEllipse(470, 360, 780, 430);
    this.map.fillEllipse(780, 315, 510, 330);
    this.map.fillEllipse(240, 510, 230, 160);
    this.map.fillEllipse(570, 570, 260, 220);
    this.map.fillEllipse(580, 130, 300, 180);
    this.map.fillStyle(0x213247, 1);
    this.map.fillEllipse(180, 190, 150, 120);
    this.map.fillEllipse(900, 650, 220, 120);
  }

  private drawConnections(): void {
    this.map.lineStyle(4, 0xd6b86a, 0.35);
    const drawn = new Set<string>();
    for (const region of this.state.regions) {
      for (const neighborId of region.neighbors) {
        const key = [region.id, neighborId].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);
        const neighbor = this.getRegion(neighborId);
        this.map.lineBetween(region.x, region.y, neighbor.x, neighbor.y);
      }
    }
  }

  private drawRegions(): void {
    for (const region of this.state.regions) {
      const selected = this.state.selectedRegionId === region.id;
      this.map.fillStyle(OWNER_COLOR[region.owner], selected ? 0.95 : 0.7);
      this.map.lineStyle(selected ? 5 : 2, selected ? 0xfacc15 : 0x111827, 1);
      this.map.fillCircle(region.x, region.y, selected ? 34 : 28);
      this.map.strokeCircle(region.x, region.y, selected ? 34 : 28);
      this.addOrUpdateRegionLabel(region);
    }
  }

  private drawArmies(): void {
    for (const army of this.state.armies) {
      const region = this.getRegion(army.regionId);
      const offset = army.faction === 'blue' ? -18 : 18;
      const selected = this.state.selectedArmyId === army.id;
      this.map.fillStyle(army.faction === 'blue' ? 0x60a5fa : 0xf87171, 1);
      this.map.lineStyle(selected ? 4 : 2, selected ? 0xfacc15 : 0x111827, 1);
      this.map.fillTriangle(region.x + offset, region.y - 52, region.x + offset - 16, region.y - 22, region.x + offset + 16, region.y - 22);
      this.map.strokeTriangle(region.x + offset, region.y - 52, region.x + offset - 16, region.y - 22, region.x + offset + 16, region.y - 22);
    }
  }

  private addOrUpdateRegionLabel(region: Region): void {
    const labelKey = `region-label-${region.id}`;
    const existing = this.children.getByName(labelKey) as Phaser.GameObjects.Text | null;
    const text = `${region.name}\n${region.garrison}`;
    if (existing) {
      existing.setText(text).setPosition(region.x, region.y + 38);
      return;
    }
    this.add.text(region.x, region.y + 38, text, { fontFamily: 'Arial', fontSize: '12px', color: '#f8fafc', align: 'center' }).setOrigin(0.5).setName(labelKey);
  }

  private updateHud(): void {
    const blue = this.state.resources.blue;
    const red = this.state.resources.red;
    this.hud.setText([
      `Europe Campaign — Turn ${this.state.turn}`,
      `Blue: 🍞 ${blue.food}  🪵 ${blue.wood}  ⛏ ${blue.iron}  🪙 ${blue.gold}`,
      `Red:  🍞 ${red.food}  🪵 ${red.wood}  ⛏ ${red.iron}  🪙 ${red.gold}`,
      'Пошаговая стратегия: выбери армию и соседний регион для похода.',
      'B: тестовая битва | N: следующий ход',
    ]);

    const region = this.state.selectedRegionId ? this.getRegion(this.state.selectedRegionId) : null;
    const army = this.getSelectedArmy();
    this.details.setText([
      region ? `Region: ${region.name}` : 'Region: none',
      region ? `Owner: ${region.owner} | Garrison: ${region.garrison}` : '',
      region ? `Income: food ${region.income.food}, wood ${region.income.wood}, iron ${region.income.iron}, gold ${region.income.gold}` : '',
      army ? `Army: ${army.name}` : 'Army: none',
      army ? `Composition: infantry ${army.infantry}, cavalry ${army.cavalry}, artillery ${army.artillery}` : '',
    ]);
  }

  private findRegionAt(x: number, y: number): Region | null {
    return this.state.regions.find((region) => Phaser.Math.Distance.Between(x, y, region.x, region.y) <= 36) ?? null;
  }

  private findArmyAt(x: number, y: number): CampaignArmy | null {
    return this.state.armies.find((army) => {
      const region = this.getRegion(army.regionId);
      const offset = army.faction === 'blue' ? -18 : 18;
      return Phaser.Math.Distance.Between(x, y, region.x + offset, region.y - 36) <= 26;
    }) ?? null;
  }

  private getSelectedArmy(): CampaignArmy | null {
    return this.state.armies.find((army) => army.id === this.state.selectedArmyId) ?? null;
  }

  private getRegion(id: string): Region {
    const region = this.state.regions.find((item) => item.id === id);
    if (!region) throw new Error(`Unknown region: ${id}`);
    return region;
  }
}
