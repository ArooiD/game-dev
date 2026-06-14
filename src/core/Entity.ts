/**
 * Базовый класс сущности для ECS (Entity Component System)
 */

import { WorldPosition, Dimensions, Color, EntityType } from '../types.js';

export abstract class Entity {
  readonly id: string;
  readonly type: EntityType;
  
  position: WorldPosition;
  dimensions: Dimensions;
  color: Color;
  
  isActive: boolean;
  parent: Entity | null = null;
  children: Entity[] = [];
  
  private _tags: Set<string> = new Set();
  private _components: Map<string, unknown> = new Map();
  
  constructor(
    id: string,
    type: EntityType,
    position: WorldPosition,
    dimensions: Dimensions,
    color: Color
  ) {
    this.id = id;
    this.type = type;
    this.position = { ...position };
    this.dimensions = { ...dimensions };
    this.color = { ...color };
    this.isActive = true;
  }
  
  /**
   * Добавляет тег сущности
   */
  addTag(tag: string): void {
    this._tags.add(tag);
  }
  
  /**
   * Удаляет тег сущности
   */
  removeTag(tag: string): void {
    this._tags.delete(tag);
  }
  
  /**
   * Проверяет наличие тега
   */
  hasTag(tag: string): boolean {
    return this._tags.has(tag);
  }
  
  /**
   * Получает все теги
   */
  getTags(): Set<string> {
    return new Set(this._tags);
  }
  
  /**
   * Добавляет компонент к сущности
   */
  addComponent<T>(name: string, component: T): void {
    this._components.set(name, component);
  }
  
  /**
   * Получает компонент по имени
   */
  getComponent<T>(name: string): T | undefined {
    return this._components.get(name) as T;
  }
  
  /**
   * Проверяет наличие компонента
   */
  hasComponent(name: string): boolean {
    return this._components.has(name);
  }
  
  /**
   * Удаляет компонент
   */
  removeComponent(name: string): void {
    this._components.delete(name);
  }
  
  /**
   * Добавляет дочернюю сущность
   */
  addChild(child: Entity): void {
    child.parent = this;
    this.children.push(child);
  }
  
  /**
   * Удаляет дочернюю сущность
   */
  removeChild(child: Entity): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }
  
  /**
   * Обновляет сущность (вызывается каждый кадр)
   */
  update(deltaTime: number): void {
    // Базовая реализация - может быть переопределена
    this.children.forEach(child => {
      if (child.isActive) {
        child.update(deltaTime);
      }
    });
  }
  
  /**
   * Получает центральную точку сущности
   */
  getCenter(): WorldPosition {
    return {
      x: this.position.x + this.dimensions.width / 2,
      y: this.position.y + this.dimensions.height / 2,
      z: this.position.z + this.dimensions.depth / 2,
    };
  }
  
  /**
   * Проверяет столкновение с другой сущностью
   */
  collidesWith(other: Entity): boolean {
    return (
      this.position.x < other.position.x + other.dimensions.width &&
      this.position.x + this.dimensions.width > other.position.x &&
      this.position.y < other.position.y + other.dimensions.height &&
      this.position.y + this.dimensions.height > other.position.y
    );
  }
  
  /**
   * Деактивирует сущность
   */
  deactivate(): void {
    this.isActive = false;
  }
  
  /**
   * Активирует сущность
   */
  activate(): void {
    this.isActive = true;
  }
}
