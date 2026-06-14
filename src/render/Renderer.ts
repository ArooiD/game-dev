/**
 * Основной рендерер для изометрической отрисовки
 */

import { Camera } from './Camera.js';
import { IsoUtils } from '../utils/IsoUtils.js';
import { WorldPosition, EntityType } from '../types.js';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  
  private _width: number;
  private _height: number;
  private _centerX: number;
  private _centerY: number;
  
  // Слой отрисовки
  private _renderLayers: Map<number, RenderItem[]> = new Map();
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = new Camera();
    
    this._width = canvas.width;
    this._height = canvas.height;
    this._centerX = this._width / 2;
    this._centerY = this._height / 2;
    
    this._setupCanvas();
  }
  
  /**
   * Настраивает Canvas
   */
  private _setupCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._width = this.canvas.width;
    this._height = this.canvas.height;
    this._centerX = this._width / 2;
    this._centerY = this._height / 2;
    
    // Обработчик изменения размера
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this._width = this.canvas.width;
      this._height = this.canvas.height;
      this._centerX = this._width / 2;
      this._centerY = this._height / 2;
    });
  }
  
  /**
   * Очищает экран
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this._width, this._height);
    
    // Фон
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this._width, this._height);
  }
  
  /**
   * Добавляет элемент для отрисовки
   */
  addRenderItem(item: RenderItem): void {
    const depth = IsoUtils.getDepth(
      item.worldPosition.x,
      item.worldPosition.y,
      item.worldPosition.z
    );
    
    if (!this._renderLayers.has(depth)) {
      this._renderLayers.set(depth, []);
    }
    this._renderLayers.get(depth)!.push(item);
  }
  
  /**
   * Отрисовывает все элементы (сортировка по глубине)
   */
  render(): void {
    this.clear();
    
    // Сортируем слои по глубине (от дальних к ближним)
    const sortedLayers = Array.from(this._renderLayers.keys()).sort((a, b) => a - b);
    
    for (const depth of sortedLayers) {
      const items = this._renderLayers.get(depth)!;
      
      for (const item of items) {
        this._renderItem(item);
      }
    }
    
    // Очищаем слои
    this._renderLayers.clear();
  }
  
  /**
   * Отрисовывает один элемент
   */
  private _renderItem(item: RenderItem): void {
    const screenPos = IsoUtils.worldToScreen(
      item.worldPosition,
      this.camera.position,
      this._centerX,
      this._centerY
    );
    
    // Применяем зум к размеру элементов
    this.ctx.save();
    
    switch (item.type) {
      case 'tile':
        this._renderTile(screenPos);
        break;
      case 'unit':
        this._renderUnit(screenPos, item);
        break;
      case 'building':
        this._renderBuilding(screenPos, item);
        break;
      case 'selection':
        this._renderSelection(screenPos, item);
        break;
      case 'path':
        this._renderPath(screenPos, item);
        break;
      default:
        this._renderDefault(screenPos, item);
    }
    
    this.ctx.restore();
  }
  
  /**
   * Отрисовка тайла
   */
  private _renderTile(pos: { x: number; y: number }): void {
    const width = IsoUtils.TILE_WIDTH * this.camera.zoom;
    const height = IsoUtils.TILE_HEIGHT * this.camera.zoom;
    
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    this.ctx.lineTo(pos.x + width / 2, pos.y + height / 2);
    this.ctx.lineTo(pos.x, pos.y + height);
    this.ctx.lineTo(pos.x - width / 2, pos.y + height / 2);
    this.ctx.closePath();
    
    this.ctx.fillStyle = '#4a6741';
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#3d5635';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }
  
  /**
   * Отрисовка пути юнита
   */
  private _renderUnitPath(_unitPos: { x: number; y: number }, item: RenderItem): void {
    if (!item.pathPoints || item.pathPoints.length < 2) return;
    
    const firstPoint = item.pathPoints[0];
    const firstScreen = IsoUtils.worldToScreen(
      { x: firstPoint.x, y: firstPoint.y, z: 0 },
      this.camera.position,
      this._centerX,
      this._centerY
    );
    
    // Рисуем линию пути
    this.ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)'; // Полупрозрачный жёлтый
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([8, 4]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(firstScreen.x, firstScreen.y);
    
    for (let i = 1; i < item.pathPoints.length; i++) {
      const point = item.pathPoints[i];
      const screen = IsoUtils.worldToScreen(
        { x: point.x, y: point.y, z: 0 },
        this.camera.position,
        this._centerX,
        this._centerY
      );
      this.ctx.lineTo(screen.x, screen.y);
    }
    
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Рисуем точки пути
    for (let i = 0; i < item.pathPoints.length; i++) {
      const point = item.pathPoints[i];
      const screen = IsoUtils.worldToScreen(
        { x: point.x, y: point.y, z: 0 },
        this.camera.position,
        this._centerX,
        this._centerY
      );
      
      // Точка пути
      const dotSize = 4 * this.camera.zoom;
      this.ctx.fillStyle = i === item.pathPoints.length - 1 ? '#e74c3c' : '#f1c40f'; // Красная последняя точка
      this.ctx.beginPath();
      this.ctx.arc(screen.x, screen.y, dotSize, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  /**
   * Отрисовка юнита
   */
  private _renderUnit(pos: { x: number; y: number }, item: RenderItem): void {
    const size = 24 * this.camera.zoom;
    const height = 35 * this.camera.zoom;
    
    // Сначала рисуем путь (под юнитом)
    this._renderUnitPath(pos, item);
    
    // Тень
    this.ctx.beginPath();
    this.ctx.ellipse(pos.x, pos.y + height / 2, size / 2, size / 4, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fill();
    
    // Цвет юнита
    let unitColor = '#3498db';
    if (item.color) {
      unitColor = `rgb(${item.color.r}, ${item.color.g}, ${item.color.b})`;
    }
    
    // Тело юнита (портрет)
    this.ctx.fillStyle = unitColor;
    this.ctx.fillRect(pos.x - size / 2, pos.y - height, size, height);
    
    // Обводка
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(pos.x - size / 2, pos.y - height, size, height);
    
    // Иконка типа юнита (портрет)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${14 * this.camera.zoom}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    let icon = '⚔️'; // infantry по умолчанию
    if (item.unitType === 'archer') icon = '🏹';
    else if (item.unitType === 'cavalry') icon = '🐎';
    else if (item.unitType === 'artillery') icon = '💣';
    
    this.ctx.fillText(icon, pos.x, pos.y - height / 2);
    
    // Индикатор здоровья (если есть)
    if (item.health !== undefined && item.maxHealth !== undefined) {
      const healthPercent = item.health / item.maxHealth;
      const barWidth = size;
      const barHeight = 4;
      
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(pos.x - barWidth / 2, pos.y - height - 8, barWidth, barHeight);
      
      this.ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
      this.ctx.fillRect(pos.x - barWidth / 2, pos.y - height - 8, barWidth * healthPercent, barHeight);
    }
    
    // Стрелка направления движения (поверх всего)
    if (item.moveDirection) {
      const arrowLength = 20 * this.camera.zoom;
      const arrowOffset = height / 2 + 10 * this.camera.zoom;
      
      // Преобразуем мировое направление в экранный вектор
      // В изометрии: экранная X = мировая (X - Y), экранная Y = мировая (X + Y)
      const dirX = item.moveDirection.x - item.moveDirection.y;
      const dirY = item.moveDirection.x + item.moveDirection.y;
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
      
      if (dirLength > 0) {
        const normDirX = dirX / dirLength;
        const normDirY = dirY / dirLength;
        
        const startX = pos.x;
        const startY = pos.y - arrowOffset;
        const endX = startX + normDirX * arrowLength;
        const endY = startY + normDirY * arrowLength;
        
        // Стрелка
        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Наконечник стрелки
        const angle = Math.atan2(dirY, dirX);
        const headLength = 8 * this.camera.zoom;
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
          endX - headLength * Math.cos(angle - Math.PI / 6),
          endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
          endX - headLength * Math.cos(angle + Math.PI / 6),
          endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }
  
  /**
   * Отрисовка здания
   */
  private _renderBuilding(pos: { x: number; y: number }, item: RenderItem): void {
    const width = (item.width || 64) * this.camera.zoom;
    const buildHeight = (item.height || 40) * this.camera.zoom;
    
    // Основание
    this.ctx.fillStyle = '#95a5a6';
    this.ctx.fillRect(pos.x - width / 2, pos.y - buildHeight, width, buildHeight);
    
    // Крыша
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x - width / 2 - 10, pos.y - buildHeight);
    this.ctx.lineTo(pos.x + width / 2 + 10, pos.y - buildHeight);
    this.ctx.lineTo(pos.x, pos.y - buildHeight - 20);
    this.ctx.closePath();
    this.ctx.fillStyle = '#7f8c8d';
    this.ctx.fill();
    
    // Обводка
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(pos.x - width / 2, pos.y - buildHeight, width, buildHeight);
  }
  
  /**
   * Отрисовка выделения
   */
  private _renderSelection(pos: { x: number; y: number }, item: RenderItem): void {
    const width = (item.width || 40) * this.camera.zoom;
    const selHeight = (item.height || 40) * this.camera.zoom;
    
    this.ctx.strokeStyle = '#f1c40f';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 3]);
    
    this.ctx.beginPath();
    this.ctx.ellipse(pos.x, pos.y, width / 2, selHeight / 4, 0, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }
  
  /**
   * Отрисовка пути
   */
  private _renderPath(_pos: { x: number; y: number }, item: RenderItem): void {
    if (!item.pathPoints || item.pathPoints.length < 2) return;
    
    this.ctx.strokeStyle = '#e74c3c';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 5]);
    
    this.ctx.beginPath();
    
    const firstPoint = item.pathPoints[0];
    const firstScreen = IsoUtils.worldToScreen(
      { x: firstPoint.x, y: firstPoint.y, z: 0 },
      this.camera.position,
      this._centerX,
      this._centerY
    );
    this.ctx.moveTo(firstScreen.x, firstScreen.y);
    
    for (let i = 1; i < item.pathPoints.length; i++) {
      const point = item.pathPoints[i];
      const screen = IsoUtils.worldToScreen(
        { x: point.x, y: point.y, z: 0 },
        this.camera.position,
        this._centerX,
        this._centerY
      );
      this.ctx.lineTo(screen.x, screen.y);
    }
    
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }
  
  /**
   * Отрисовка по умолчанию
   */
  private _renderDefault(pos: { x: number; y: number }, _item: RenderItem): void {
    const size = 10 * this.camera.zoom;
    
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  /**
   * Отрисовка текста
   */
  drawText(text: string, x: number, y: number, color: string = '#fff', size: number = 16): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px Arial`;
    this.ctx.fillText(text, x, y);
  }
  
  /**
   * Отрисовка прямоугольника
   */
  drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }
}

/**
 * Элемент для отрисовки
 */
export interface RenderItem {
  type: 'tile' | 'unit' | 'building' | 'selection' | 'path' | 'default';
  worldPosition: WorldPosition;
  health?: number;
  maxHealth?: number;
  width?: number;
  height?: number;
  pathPoints?: WorldPosition[];
  entityType?: EntityType;
  unitType?: string;
  color?: { r: number; g: number; b: number; a: number };
  moveDirection?: { x: number; y: number };
  path?: WorldPosition[];
}
