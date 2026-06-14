/**
 * Базовый класс юнита
 */

import { Entity } from '../core/Entity.js';
import { EntityType, WorldPosition, Dimensions, Color, UnitType, UnitStats } from '../types.js';

export class Unit extends Entity {
  unitType: UnitType;
  stats: UnitStats;
  team: string;
  
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
  }
}
