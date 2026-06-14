/**
 * Менеджер пользовательского интерфейса
 */

import { Renderer } from '../render/Renderer.js';
import { SelectionPanel } from './SelectionPanel.js';
import { Unit } from '../entities/Unit.js';
import { Resources } from '../types.js';

export class UIManager {
  private _renderer: Renderer;
  private _selectionPanel: SelectionPanel;
  private _resources: Resources;
  
  constructor(renderer: Renderer) {
    this._renderer = renderer;
    this._selectionPanel = new SelectionPanel(renderer);
    this._resources = {
      food: 600,
      wood: 400,
      iron: 200,
      gold: 300,
      population: 0,
      populationLimit: 50
    };
  }
  
  /**
   * Отрисовка всего UI
   */
  render(selectedUnits: Set<Unit>): void {
    this._renderResources();
    this._selectionPanel.render(selectedUnits);
  }
  
  /**
   * Отрисовка ресурсов
   */
  private _renderResources(): void {
    const ctx = this._renderer.ctx;
    const canvas = this._renderer.canvas;
    
    // Фон панели ресурсов
    const panelHeight = 30;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, canvas.height - panelHeight, canvas.width, panelHeight);
    
    // Рамка
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - panelHeight);
    ctx.lineTo(canvas.width, canvas.height - panelHeight);
    ctx.stroke();
    
    // Ресурсы
    const resources = [
      { name: 'Food', value: this._resources.food, color: '#e74c3c', icon: '🌾' },
      { name: 'Wood', value: this._resources.wood, color: '#8b4513', icon: '🪵' },
      { name: 'Iron', value: this._resources.iron, color: '#7f8c8d', icon: '⚙️' },
      { name: 'Gold', value: this._resources.gold, color: '#f1c40f', icon: '💰' },
    ];
    
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    let x = 10;
    for (const res of resources) {
      // Иконка
      ctx.fillText(res.icon, x, canvas.height - 10);
      x += 15;
      
      // Название и значение
      ctx.fillStyle = res.color;
      ctx.fillText(`${res.name}: ${res.value}`, x, canvas.height - 10);
      x += ctx.measureText(`${res.name}: ${res.value}`).width + 20;
    }
    
    // Население
    ctx.fillStyle = '#3498db';
    ctx.fillText(
      `Pop: ${this._resources.population}/${this._resources.populationLimit}`,
      canvas.width - 120,
      canvas.height - 10
    );
  }
  
  /**
   * Обновляет ресурсы
   */
  updateResources(resources: Partial<Resources>): void {
    this._resources = { ...this._resources, ...resources };
  }
  
  /**
   * Увеличивает население
   */
  modifyPopulation(delta: number): void {
    this._resources.population = Math.max(0, Math.min(
      this._resources.populationLimit,
      this._resources.population + delta
    ));
  }
  
  /**
   * Увеличивает ресурс
   */
  addResource(name: keyof Resources, amount: number): void {
    if (name === 'population' || name === 'populationLimit') return;
    this._resources[name] = Math.max(0, this._resources[name] + amount);
  }
}
