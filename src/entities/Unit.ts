/**
 * Базовый класс юнита
 */

import { Entity } from '../core/Entity.js';
import { EntityType, WorldPosition, Dimensions, Color, UnitType, UnitStats } from '../types.js';
import { TileMap } from '../system/TileMap.js';

export class Unit extends Entity {
  unitType: UnitType;
  stats: UnitStats;
  team: string;
  
  // Путь для движения
  path: WorldPosition[] = [];
  currentPathIndex: number = 0;
  moveSpeed: number = 3; // единиц в секунду
  tileMap: TileMap | null = null;
  
  // Направление движения (для визуализации)
  moveDirection: { x: number; y: number } | null = null;
  
  constructor(
    id: string,
    unitType: UnitType,
    position: WorldPosition,
    dimensions: Dimensions,
    color: Color,
    team: string = 'player1'
  ) {
    super(id, EntityType.UNIT, position, dimensions, color);
    this.unitType = unitType;
    this.team = team;
    this.stats = this._getDefaultStats(unitType);
    this.moveSpeed = this.stats.moveSpeed;
  }
  
  /**
   * Устанавливает карту для pathfinding
   */
  setTileMap(tileMap: TileMap): void {
    this.tileMap = tileMap;
  }
  
  /**
   * Устанавливает цель движения с pathfinding
   */
  moveTo(x: number, y: number): void {
    if (!this.tileMap) {
      // Если карты нет, просто двигаемся напрямую
      this.path = [
        { x: this.position.x, y: this.position.y, z: 0 },
        { x, y, z: 0 }
      ];
    } else {
      // Ищем путь по карте
      const path = this.tileMap.findPath(
        Math.floor(this.position.x),
        Math.floor(this.position.y),
        Math.floor(x),
        Math.floor(y)
      );
      
      if (path && path.length > 0) {
        this.path = path.map(p => ({ x: p.x, y: p.y, z: 0 }));
        this.currentPathIndex = 0;
      } else {
        // Путь не найден, пробуем напрямую
        console.warn('Path not found, moving directly');
        this.path = [
          { x: this.position.x, y: this.position.y, z: 0 },
          { x, y, z: 0 }
        ];
      }
    }
  }
  
  /**
   * Получает статистку по типу юнита
   */
  private _getDefaultStats(type: UnitType): UnitStats {
    switch (type) {
      case UnitType.INFANTRY:
        return {
          health: 100,
          maxHealth: 100,
          morale: 100,
          maxMorale: 100,
          stamina: 100,
          maxStamina: 100,
          ammo: 20,
          maxAmmo: 20,
          damage: 10,
          range: 5,
          attackSpeed: 1,
          moveSpeed: 3,
          reloadTime: 2,
        };
      case UnitType.ARCHER:
        return {
          health: 80,
          maxHealth: 80,
          morale: 100,
          maxMorale: 100,
          stamina: 100,
          maxStamina: 100,
          ammo: 50,
          maxAmmo: 50,
          damage: 8,
          range: 15,
          attackSpeed: 1.5,
          moveSpeed: 3.5,
          reloadTime: 1.5,
        };
      case UnitType.CAVALRY:
        return {
          health: 150,
          maxHealth: 150,
          morale: 90,
          maxMorale: 90,
          stamina: 80,
          maxStamina: 80,
          ammo: 0,
          maxAmmo: 0,
          damage: 20,
          range: 2,
          attackSpeed: 1.2,
          moveSpeed: 6,
          reloadTime: 0,
        };
      case UnitType.ARTILLERY:
        return {
          health: 60,
          maxHealth: 60,
          morale: 70,
          maxMorale: 70,
          stamina: 100,
          maxStamina: 100,
          ammo: 10,
          maxAmmo: 10,
          damage: 50,
          range: 25,
          attackSpeed: 3,
          moveSpeed: 1,
          reloadTime: 5,
        };
      default:
        return {
          health: 100,
          maxHealth: 100,
          morale: 100,
          maxMorale: 100,
          stamina: 100,
          maxStamina: 100,
          ammo: 0,
          maxAmmo: 0,
          damage: 10,
          range: 1,
          attackSpeed: 1,
          moveSpeed: 3,
          reloadTime: 0,
        };
    }
  }
  
  /**
   * Наносит урон
   */
  takeDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
    
    // Снижение морали при получении урона
    this.stats.morale = Math.max(0, this.stats.morale - amount * 0.5);
  }
  
  /**
   * Проверяет, жив ли юнит
   */
  isAlive(): boolean {
    return this.stats.health > 0;
  }
  
  /**
   * Обновляет юнита
   */
  update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Регенерация морали
    if (this.stats.morale < this.stats.maxMorale) {
      this.stats.morale = Math.min(
        this.stats.maxMorale,
        this.stats.morale + deltaTime * 2
      );
    }
    
    // Регенерация выносливости
    if (this.stats.stamina < this.stats.maxStamina) {
      this.stats.stamina = Math.min(
        this.stats.maxStamina,
        this.stats.stamina + deltaTime * 5
      );
    }
    
    // Обработка движения по пути
    if (this.path.length > 0 && this.currentPathIndex < this.path.length) {
      // Находим ближайшую целевую точку (пропускаем точки, которые уже "за" нами)
      let targetIndex = this.currentPathIndex;
      
      // Проверяем, можно ли двигаться напрямую к более дальней точке
      while (targetIndex + 1 < this.path.length) {
        const currentTarget = this.path[targetIndex];
        const nextTarget = this.path[targetIndex + 1];
        
        const dxToCurrent = currentTarget.x - this.position.x;
        const dyToCurrent = currentTarget.y - this.position.y;
        const distToCurrent = Math.sqrt(dxToCurrent * dxToCurrent + dyToCurrent * dyToCurrent);
        
        const dxToNext = nextTarget.x - this.position.x;
        const dyToNext = nextTarget.y - this.position.y;
        const distToNext = Math.sqrt(dxToNext * dxToNext + dyToNext * dyToNext);
        
        // Если следующая точка дальше, чем текущая, и мы уже прошли мимо текущей
        // или если векторы направлены примерно в одну сторону
        const dotProduct = dxToCurrent * dxToNext + dyToCurrent * dyToNext;
        const isSameDirection = dotProduct > 0; // Острый угол между векторами
        
        if (isSameDirection && distToNext < distToCurrent + 0.5) {
          // Можно двигаться к следующей точке
          targetIndex++;
        } else {
          break;
        }
      }
      
      const target = this.path[targetIndex];
      const dx = target.x - this.position.x;
      const dy = target.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0.3) {
        // Двигаемся к целевой точке
        const moveDistance = this.moveSpeed * deltaTime;
        const moveX = (dx / distance) * Math.min(moveDistance, distance);
        const moveY = (dy / distance) * Math.min(moveDistance, distance);
        
        // Сохраняем направление для визуализации
        this.moveDirection = { x: dx / distance, y: dy / distance };
        
        this.position.x += moveX;
        this.position.y += moveY;
      } else {
        // Достигли точки пути, сбрасываем направление
        this.moveDirection = null;
        this.currentPathIndex = targetIndex + 1;
        if (this.currentPathIndex >= this.path.length) {
          // Достигли конечной точки
          this.path = [];
          this.currentPathIndex = 0;
        }
      }
    }
  }
  
  /**
   * Отменяет движение
   */
  stop(): void {
    this.path = [];
    this.currentPathIndex = 0;
  }
}
