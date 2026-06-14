import 'phaser';

class MainScene extends Phaser.Scene {
  private mapWidth = 32;
  private mapHeight = 32;
  private tileSize = 64;
  private units: Phaser.GameObjects.Rectangle[] = [];
  private selectedUnits: Phaser.GameObjects.Rectangle[] = [];
  private selectionBox?: Phaser.GameObjects.Graphics;
  private selectionStart: Phaser.Math.Vector2 | null = null;
  
  constructor() {
    super({ key: 'MainScene' });
  }
  
  create(): void {
    const camera = this.cameras.main;
    camera.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize);
    
    this.createMap();
    this.createUnits();
    this.setupInput();
    
    console.log('🎮 Phaser RTS v1.0');
  }
  
  update(_time: number, delta: number): void {
    if (this.selectionBox && this.selectionStart) {
      const pointer = this.input.activePointer;
      const minX = Math.min(this.selectionStart.x, pointer.x);
      const maxX = Math.max(this.selectionStart.x, pointer.x);
      const minY = Math.min(this.selectionStart.y, pointer.y);
      const maxY = Math.max(this.selectionStart.y, pointer.y);
      
      this.selectionBox.clear();
      this.selectionBox.lineStyle(2, 0xffcc00, 0.8);
      this.selectionBox.strokeRect(minX, minY, maxX - minX, maxY - minY);
    }
    
    this.units.forEach(unit => {
      const data = unit.getData('target');
      if (data) {
        const tx = data.x as number;
        const ty = data.y as number;
        const speed = 3;
        const dx = tx - unit.x;
        const dy = ty - unit.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
          unit.x += (dx / dist) * speed * (delta / 16);
          unit.y += (dy / dist) * speed * (delta / 16);
        } else {
          unit.setData('target', null);
        }
      }
    });
  }
  
  private createMap(): void {
    const graphics = this.add.graphics();
    graphics.setDepth(0);
    
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const posX = x * this.tileSize;
        const posY = y * this.tileSize;
        const distFromCenter = Math.sqrt(Math.pow(x - this.mapWidth / 2, 2) + Math.pow(y - this.mapHeight / 2, 2));
        
        let color = 0x4a6741;
        if (distFromCenter > 10 && Math.random() < 0.1) {
          color = Math.random() < 0.3 ? 0x2d5016 : 0x808080;
        }
        
        graphics.fillStyle(color, 1);
        graphics.fillRect(posX, posY, this.tileSize, this.tileSize);
        graphics.lineStyle(1, 0x000000, 0.05);
        graphics.strokeRect(posX, posY, this.tileSize, this.tileSize);
      }
    }
  }
  
  private createUnits(): void {
    const centerX = this.mapWidth * this.tileSize / 2;
    const centerY = this.mapHeight * this.tileSize / 2;
    const colors = [0x3498db, 0x2ecc71, 0x9b59b6];
    
    for (let i = 0; i < 3; i++) {
      const unit = this.add.rectangle(centerX + i * 80, centerY, 30, 30, colors[i]);
      unit.setDepth(10);
      this.units.push(unit);
    }
  }
  
  private setupInput(): void {
    const camera = this.cameras.main;
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() && this.selectedUnits.length > 0) {
        this.showPath(this.selectedUnits[0], pointer.x, pointer.y);
        this.selectedUnits.forEach(unit => {
          unit.setData('target', { x: pointer.x, y: pointer.y });
        });
      }
    });
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.selectionStart = new Phaser.Math.Vector2(pointer.x, pointer.y);
        if (!this.selectionBox) {
          this.selectionBox = this.add.graphics();
          this.selectionBox.setDepth(100);
        }
      }
    });
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.selectionStart && this.selectionBox) {
        const minX = Math.min(this.selectionStart.x, pointer.x);
        const maxX = Math.max(this.selectionStart.x, pointer.x);
        const minY = Math.min(this.selectionStart.y, pointer.y);
        const maxY = Math.max(this.selectionStart.y, pointer.y);
        
        this.selectedUnits = [];
        this.units.forEach(unit => {
          if (unit.x >= minX && unit.x <= maxX && unit.y >= minY && unit.y <= maxY) {
            this.selectedUnits.push(unit);
          }
        });
        
        this.selectionBox.destroy();
        this.selectionBox = undefined;
        this.selectionStart = null;
      }
    });
    
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const speed = 10;
      if (event.code === 'KeyW') camera.scrollY -= speed;
      if (event.code === 'KeyS') camera.scrollY += speed;
      if (event.code === 'KeyA') camera.scrollX -= speed;
      if (event.code === 'KeyD') camera.scrollX += speed;
    });
  }
  
  private showPath(unit: Phaser.GameObjects.Rectangle, targetX: number, targetY: number): void {
    const graphics = this.add.graphics();
    graphics.setDepth(100);
    graphics.lineStyle(2, 0xf1c40f, 0.7);
    graphics.beginPath();
    graphics.moveTo(unit.x, unit.y);
    graphics.lineTo(targetX, targetY);
    graphics.strokePath();
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(targetX, targetY, 6);
    setTimeout(() => graphics.destroy(), 1500);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a202c',
  scene: [MainScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

const game = new Phaser.Game(config);
console.log('🎮 Phaser RTS v1.0');
export default game;
