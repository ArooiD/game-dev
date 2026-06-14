/**
 * Основной класс игры
 */

import { GameLoop } from './GameLoop.js';
import { Renderer } from '../render/Renderer.js';
import { InputHandler } from '../input/InputHandler.js';
import { EntityManager } from '../core/EntityManager.js';
import { EntityType, Color, Resources, UnitType } from '../types.js';
import { Unit } from '../entities/Unit.js';

export class Game {
  gameLoop: GameLoop;
  renderer: Renderer;
  input: InputHandler;
  entityManager: EntityManager;
  
  // Состояние игры
  private _state: 'INIT' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' = 'INIT';
  
  // Игровые объекты
  private _selectedEntities: Set<Unit> = new Set();
  private _resources: Resources = {
    food: 500,
    wood: 200,
    iron: 100,
    gold: 50,
    population: 0,
    populationLimit: 50,
  };
  
  // Карта
  private _mapWidth: number = 32;
  private _mapHeight: number = 32;
  
  constructor() {
    this.gameLoop = new GameLoop();
    this.entityManager = new EntityManager();
    
    // Создаем canvas
    const container = document.getElementById('game-container');
    if (!container) {
      throw new Error('Game container not found');
    }
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();
    
    this._setupCallbacks();
  }
  
  /**
   * Настраивает callback'и
   */
  private _setupCallbacks(): void {
    // Выделение сущностей
    this.input.onSelectionEnd = () => {
      this._handleSelection();
    };
    
    // Движение по правому клику
    this.input.onMoveCommand = (pos) => {
      this._handleMoveCommand(pos);
    };
    
    // Скролл зума
    this.input.onScroll = (delta) => {
      this.renderer.camera.zoomBy(delta);
    };
    
    // Движение камеры по краям
    this.input.onKey = (key, pressed) => {
      if (pressed) {
        this._handleKeyPress(key);
      }
    };
    
    // Callback'и игрового цикла
    this.gameLoop.onUpdate = (deltaTime) => this._update(deltaTime);
    this.gameLoop.onRender = () => this._render();
  }
  
  /**
   * Инициализирует игру
   */
  init(): void {
    console.log('Initializing game...');
    
    // Создаем тестовые сущности
    this._createTestScene();
    
    // Устанавливаем границы камеры
    this.renderer.camera.setBounds(0, this._mapWidth, 0, this._mapHeight);
    this.renderer.camera.centerOn(this._mapWidth / 2, this._mapHeight / 2);
    
    this._state = 'PLAYING';
    console.log('Game initialized');
  }
  
  /**
   * Запускает игру
   */
  start(): void {
    this.gameLoop.start();
  }
  
  /**
   * Останавливает игру
   */
  stop(): void {
    this.gameLoop.stop();
    this._state = 'PAUSED';
  }
  
  /**
   * Обновление игры
   */
  private _update(deltaTime: number): void {
    if (this._state !== 'PLAYING') return;
    
    // Обновляем камеру
    this.renderer.camera.update();
    
    // Движение камеры по клавишам
    const delta = this._getCameraMoveDelta();
    if (delta.x !== 0 || delta.y !== 0) {
      this.renderer.camera.move(delta.x, delta.y);
    }
    
    // Обновляем сущности
    this.entityManager.update(deltaTime);
  }
  
  /**
   * Отрисовка игры
   */
  private _render(): void {
    // Добавляем тайлы карты
    this._renderMap();
    
    // Добавляем сущности
    for (const entity of this.entityManager.getAll()) {
      if (!entity.isActive) continue;
      
      this.renderer.addRenderItem({
        type: entity.type as any,
        worldPosition: entity.position,
        health: entity.hasComponent('health') ? 
          (entity.getComponent('health') as any).health : undefined,
        maxHealth: entity.hasComponent('health') ? 
          (entity.getComponent('health') as any).maxHealth : undefined,
        width: entity.dimensions.width,
        height: entity.dimensions.height,
      });
    }
    
    // Отрисовка рамки выделения (зеленая)
    if (this.input.isSelecting && this.input.selectionStart && this.input.selectionEnd) {
      const startX = Math.min(this.input.selectionStart.x, this.input.selectionEnd.x);
      const startY = Math.min(this.input.selectionStart.y, this.input.selectionEnd.y);
      const width = Math.abs(this.input.selectionEnd.x - this.input.selectionStart.x);
      const height = Math.abs(this.input.selectionEnd.y - this.input.selectionStart.y);
      
      // Зеленая полупрозрачная область
      this.renderer.drawRect(
        startX,
        startY,
        width,
        height,
        'rgba(46, 204, 113, 0.3)'
      );
      
      // Зеленая рамка
      this.renderer.ctx.strokeStyle = '#2ecc71';
      this.renderer.ctx.lineWidth = 2;
      this.renderer.ctx.strokeRect(startX, startY, width, height);
    }
    
    // Отрисовка выделенных сущностей
    for (const entity of this._selectedEntities) {
      this.renderer.addRenderItem({
        type: 'selection',
        worldPosition: entity.position,
        width: entity.dimensions.width * 2,
        height: entity.dimensions.height * 2,
      });
    }
    
    // Отрисовка UI
    this._renderUI();
    
    // Рендерим всё
    this.renderer.render();
  }
  
  /**
   * Отрисовка карты
   */
  private _renderMap(): void {
    const visible = this.renderer.camera.getVisibleBounds(
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
    
    const startX = Math.max(0, Math.floor(visible.minX) - 1);
    const endX = Math.min(this._mapWidth, Math.ceil(visible.maxX) + 1);
    const startY = Math.max(0, Math.floor(visible.minY) - 1);
    const endY = Math.min(this._mapHeight, Math.ceil(visible.maxY) + 1);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        this.renderer.addRenderItem({
          type: 'tile',
          worldPosition: { x, y, z: 0 },
        });
      }
    }
  }
  
  /**
   * Отрисовка UI
   */
  private _renderUI(): void {
    const ctx = this.renderer.ctx;
    
    // FPS
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(`FPS: ${this.gameLoop.fps}`, 10, 20);
    
    // Ресурсы
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`Food: ${this._resources.food}`, 10, 40);
    ctx.fillText(`Wood: ${this._resources.wood}`, 10, 55);
    ctx.fillText(`Iron: ${this._resources.iron}`, 10, 70);
    ctx.fillText(`Gold: ${this._resources.gold}`, 10, 85);
    ctx.fillText(`Population: ${this._resources.population}/${this._resources.populationLimit}`, 10, 100);
    
    // Выделенные сущности
    ctx.fillStyle = '#3498db';
    ctx.fillText(`Selected: ${this._selectedEntities.size}`, 10, 120);
  }
  
  /**
   * Обработка выделения
   */
  private _handleSelection(): void {
    const selectionBox = this.input.getSelectionBox();
    if (!selectionBox) return;
    
    this._selectedEntities.clear();
    
    const canvas = this.renderer.canvas;
    
    for (const entity of this.entityManager.getAll()) {
      if (!entity.isActive || entity.type !== EntityType.UNIT) continue;
      
      const screenPos = this.renderer.camera.worldToScreen(
        entity.position.x,
        entity.position.y,
        canvas.width / 2,
        canvas.height / 2
      );
      
      if (this.input.isPointInSelection(screenPos)) {
        this._selectedEntities.add(entity as Unit);
      }
    }
  }
  
  /**
   * Обработка команды движения
   */
  private _handleMoveCommand(screenPos: { x: number; y: number }): void {
    if (this._selectedEntities.size === 0) return;
    
    // Преобразуем в мировые координаты
    const worldPos = this.renderer.camera.screenToWorld(
      screenPos.x,
      screenPos.y,
      this.renderer.canvas.width / 2,
      this.renderer.canvas.height / 2
    );
    
    // Визуализируем точку назначения (не перемещаем юнит сразу)
    console.log('Move command to:', worldPos);
    
    // Добавляем визуальный маркер цели
    this.renderer.addRenderItem({
      type: 'default',
      worldPosition: { 
        x: Math.floor(worldPos.x), 
        y: Math.floor(worldPos.y), 
        z: 0 
      },
    });
    
    // Здесь будет логика отправки команды юнитам с pathfinding
    // Для прототипа просто запоминаем цель (но не перемещаем сразу)
    // const firstEntity = Array.from(this._selectedEntities)[0];
    // if (firstEntity) {
    //   firstEntity.targetPosition = { x: worldPos.x, y: worldPos.y };
    // }
  }
  
  /**
   * Обработка нажатия клавиш
   */
  private _handleKeyPress(key: string): void {
    const moveSpeed = 0.5;
    
    // Обработка стрелок для движения камеры
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        this.renderer.camera.move(0, -moveSpeed);
        break;
      case 'arrowdown':
      case 's':
        this.renderer.camera.move(0, moveSpeed);
        break;
      case 'arrowleft':
      case 'a':
        this.renderer.camera.move(-moveSpeed, 0);
        break;
      case 'arrowright':
      case 'd':
        this.renderer.camera.move(moveSpeed, 0);
        break;
      case 'escape':
        this._selectedEntities.clear();
        this.input.clearSelection();
        break;
      case ' ':
        if (this._state === 'PLAYING') {
          this.stop();
        } else {
          this.start();
        }
        break;
    }
  }
  
  /**
   * Получает смещение для движения камеры
   */
  private _getCameraMoveDelta(): { x: number; y: number } {
    return this.input.getCameraMoveDelta(
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
  }
  
  /**
   * Создаёт тестовую сцену
   */
  private _createTestScene(): void {
    // Создаем несколько юнитов
    const colors: Color[] = [
      { r: 52, g: 152, b: 219, a: 1 },
      { r: 39, g: 174, b: 96, a: 1 },
      { r: 155, g: 89, b: 182, a: 1 },
    ];
    
    const unitTypes: UnitType[] = [UnitType.INFANTRY, UnitType.ARCHER, UnitType.CAVALRY];
    
    for (let i = 0; i < 3; i++) {
      const unit = new Unit(
        `unit_${i}`,
        unitTypes[i],
        { x: 10 + i * 2, y: 10, z: 0 },
        { width: 1, height: 1, depth: 1 },
        colors[i]
      );
      unit.addTag('player1');
      this.entityManager.add(unit);
    }
  }
  
  /**
   * Получает состояние игры
   */
  getState(): 'INIT' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' {
    return this._state;
  }
  
  /**
   * Получает выделенные сущности
   */
  getSelectedEntities(): Set<Unit> {
    return this._selectedEntities;
  }
  
  /**
   * Получает ресурсы
   */
  getResources(): Resources {
    return { ...this._resources };
  }
}
