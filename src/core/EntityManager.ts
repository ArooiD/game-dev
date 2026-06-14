/**
 * Менеджер сущностей - управляет жизненным циклом всех сущностей в игре
 */

import { Entity } from './Entity.js';
import { EntityType } from '../types.js';

export class EntityManager {
  private _entities: Map<string, Entity> = new Map();
  private _entitiesByType: Map<EntityType, Entity[]> = new Map();
  private _entitiesByTag: Map<string, Entity[]> = new Map();
  
  private _nextId: number = 0;
  
  /**
   * Создаёт новую сущность
   */
  create<T extends Entity>(entityClass: new (...args: any[]) => T, ...args: any[]): T {
    const entity = new entityClass(...args);
    this.add(entity);
    return entity;
  }
  
  /**
   * Добавляет сущность в менеджер
   */
  add(entity: Entity): void {
    this._entities.set(entity.id, entity);
    
    // Индексация по типу
    if (!this._entitiesByType.has(entity.type)) {
      this._entitiesByType.set(entity.type, []);
    }
    this._entitiesByType.get(entity.type)!.push(entity);
    
    // Индексация по тегам
    entity.getTags().forEach(tag => {
      if (!this._entitiesByTag.has(tag)) {
        this._entitiesByTag.set(tag, []);
      }
      this._entitiesByTag.get(tag)!.push(entity);
    });
  }
  
  /**
   * Удаляет сущность
   */
  remove(entity: Entity): void {
    this._entities.delete(entity.id);
    
    // Удаляем из индекса по типу
    const typeEntities = this._entitiesByType.get(entity.type);
    if (typeEntities) {
      const index = typeEntities.indexOf(entity);
      if (index > -1) {
        typeEntities.splice(index, 1);
      }
    }
    
    // Удаляем из индекса по тегам
    entity.getTags().forEach(tag => {
      const tagEntities = this._entitiesByTag.get(tag);
      if (tagEntities) {
        const index = tagEntities.indexOf(entity);
        if (index > -1) {
          tagEntities.splice(index, 1);
        }
      }
    });
    
    // Освобождаем дочерние сущности
    entity.children.forEach(child => this.remove(child));
  }
  
  /**
   * Получает сущность по ID
   */
  get(id: string): Entity | undefined {
    return this._entities.get(id);
  }
  
  /**
   * Получает все сущности
   */
  getAll(): Entity[] {
    return Array.from(this._entities.values());
  }
  
  /**
   * Получает сущности по типу
   */
  getByType(type: EntityType): Entity[] {
    return this._entitiesByType.get(type) || [];
  }
  
  /**
   * Получает сущности по тегу
   */
  getByTag(tag: string): Entity[] {
    return this._entitiesByTag.get(tag) || [];
  }
  
  /**
   * Получает количество сущностей
   */
  getCount(): number {
    return this._entities.size;
  }
  
  /**
   * Получает количество сущностей по типу
   */
  getCountByType(type: EntityType): number {
    return this._entitiesByType.get(type)?.length || 0;
  }
  
  /**
   * Обновляет все сущности
   */
  update(deltaTime: number): void {
    for (const entity of this._entities.values()) {
      if (entity.isActive) {
        entity.update(deltaTime);
      }
    }
  }
  
  /**
   * Очищает все сущности
   */
  clear(): void {
    this._entities.clear();
    this._entitiesByType.clear();
    this._entitiesByTag.clear();
    this._nextId = 0;
  }
  
  /**
   * Генерирует уникальный ID
   */
  generateId(): string {
    return `entity_${this._nextId++}`;
  }
}
