/**
 * Базовый класс здания
 */

import { Entity } from '../core/Entity.js';
import { EntityType, WorldPosition, Dimensions, Color, BuildingType } from '../types.js';

export class Building extends Entity {
  buildingType: BuildingType;
  team: string;
  isOperational: boolean;
  
  constructor(
    id: string,
    buildingType: BuildingType,
    position: WorldPosition,
    dimensions: Dimensions,
    color: Color,
    team: string = 'player1'
  ) {
    super(id, EntityType.BUILDING, position, dimensions, color);
    this.buildingType = buildingType;
    this.team = team;
    this.isOperational = true;
    
    // Настраиваем размеры в зависимости от типа
    this._setupDimensions(buildingType);
  }
  
  /**
   * Настраивает размеры здания
   */
  private _setupDimensions(type: BuildingType): void {
    switch (type) {
      case BuildingType.TOWN_CENTER:
        this.dimensions = { width: 8, height: 8, depth: 6 };
        break;
      case BuildingType.BARRACKS:
        this.dimensions = { width: 6, height: 4, depth: 4 };
        break;
      case BuildingType.STABLE:
        this.dimensions = { width: 5, height: 6, depth: 4 };
        break;
      case BuildingType.ARTILLERY_FOUNDRY:
        this.dimensions = { width: 7, height: 5, depth: 5 };
        break;
      case BuildingType.WALL:
        this.dimensions = { width: 2, height: 1, depth: 3 };
        break;
      default:
        this.dimensions = { width: 4, height: 4, depth: 3 };
    }
  }
  
  /**
   * Обновляет здание
   */
  update(deltaTime: number): void {
    super.update(deltaTime);
    // Логика обновления здания
  }
}
