/**
 * Панель информации о выделенных юнитах
 */

import { Unit } from '../entities/Unit.js';
import { Renderer } from '../render/Renderer.js';

export class SelectionPanel {
  private _renderer: Renderer;
  private _x: number = 10;
  private _y: number = 10;
  private _width: number = 200;
  private _height: number = 120;
  private _fontSize: number = 12;
  private _padding: number = 8;
  
  constructor(renderer: Renderer) {
    this._renderer = renderer;
  }
  
  /**
   * Отрисовка панели выделенных юнитов
   */
  render(selectedUnits: Set<Unit>): void {
    const ctx = this._renderer.ctx;
    
    // Если ничего не выделено
    if (selectedUnits.size === 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this._x, this._y, this._width, this._height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `${this._fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('No units selected', this._x + this._width / 2, this._y + this._height / 2);
      
      return;
    }
    
    const units = Array.from(selectedUnits);
    const firstUnit = units[0];
    
    // Фон панели
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(this._x, this._y, this._width, this._height);
    
    // Рамка
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(this._x, this._y, this._width, this._height);
    
    // Заголовок
    ctx.fillStyle = '#ffd700';
    ctx.font = `bold ${this._fontSize + 2}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(this._getUnitName(firstUnit.unitType), this._x + this._padding, this._y + this._padding + this._fontSize);
    
    // Количество юнитов
    ctx.fillStyle = '#888888';
    ctx.font = `${this._fontSize}px Arial`;
    ctx.fillText(`Count: ${units.length}`, this._x + this._width - this._padding, this._y + this._padding + this._fontSize);
    
    // Статистика
    let yPos = this._y + this._padding * 2 + this._fontSize + 5;
    
    // Здоровье
    this._drawStatRow(ctx, 'Health:', firstUnit.stats.health, firstUnit.stats.maxHealth, yPos);
    yPos += this._fontSize + 3;
    
    // Мораль
    this._drawStatRow(ctx, 'Morale:', Math.round(firstUnit.stats.morale), firstUnit.stats.maxMorale, yPos);
    yPos += this._fontSize + 3;
    
    // Выносливость
    this._drawStatRow(ctx, 'Stamina:', Math.round(firstUnit.stats.stamina), firstUnit.stats.maxStamina, yPos);
    yPos += this._fontSize + 3;
    
    // Урон
    ctx.fillStyle = '#ff6b6b';
    ctx.font = `${this._fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`Damage: ${firstUnit.stats.damage}`, this._x + this._padding, yPos);
    yPos += this._fontSize + 3;
    
    // Дальность
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText(`Range: ${firstUnit.stats.range}`, this._x + this._padding, yPos);
    yPos += this._fontSize + 3;
    
    // Скорость
    ctx.fillStyle = '#ffe66d';
    ctx.fillText(`Speed: ${firstUnit.stats.moveSpeed}`, this._x + this._padding, yPos);
    yPos += this._fontSize + 3;
    
    // Команда (если есть путь)
    if (firstUnit.path.length > 0) {
      ctx.fillStyle = '#95e1d3';
      ctx.fillText('Command: Moving...', this._x + this._padding, yPos);
    }
  }
  
  /**
   * Отрисовка строки со статистикой и полоской
   */
  private _drawStatRow(
    ctx: CanvasRenderingContext2D,
    label: string,
    value: number,
    max: number,
    y: number
  ): void {
    // Текст
    ctx.fillStyle = '#ffffff';
    ctx.font = `${this._fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`${label} ${value}/${max}`, this._x + this._padding, y);
    
    // Полоска (если есть место)
    const barWidth = 80;
    const barHeight = 6;
    const barX = this._x + this._width - barWidth - this._padding;
    const barY = y - 5;
    
    // Фон полоски
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Заполнение полоски
    const fillPercent = Math.max(0, Math.min(1, value / max));
    
    // Цвет полоски в зависимости от процента
    if (fillPercent > 0.6) {
      ctx.fillStyle = '#2ecc71'; // зелёный
    } else if (fillPercent > 0.3) {
      ctx.fillStyle = '#f39c12'; // оранжевый
    } else {
      ctx.fillStyle = '#e74c3c'; // красный
    }
    
    ctx.fillRect(barX, barY, barWidth * fillPercent, barHeight);
    
    // Рамка полоски
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
  
  /**
   * Получает название юнита
   */
  private _getUnitName(unitType: string): string {
    const names: Record<string, string> = {
      'infantry': 'Infantry',
      'archer': 'Archer',
      'cavalry': 'Cavalry',
      'artillery': 'Artillery'
    };
    return names[unitType] || 'Unit';
  }
  
  /**
   * Обновляет размеры панели
   */
  setSize(width: number, height: number): void {
    this._width = width;
    this._height = height;
  }
  
  /**
   * Устанавливает позицию панели
   */
  setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
  }
}
