/**
 * Система тайловой карты с поддержкой pathfinding
 */

import { Vector2 } from '../types.js';

export enum TileType {
  GRASS = 'grass',
  WATER = 'water',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  ROAD = 'road',
}

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  walkable: boolean;
  cost: number; // Стоимость перемещения (для pathfinding)
}

export class TileMap {
  private _width: number;
  private _height: number;
  private _tiles: Map<string, Tile> = new Map();
  
  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._generateMap();
  }
  
  /**
   * Генерирует карту с различными типами тайлов
   */
  private _generateMap(): void {
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        let type: TileType = TileType.GRASS;
        let walkable = true;
        let cost = 1;
        
        // Простая генерация ландшафта
        const noise = Math.sin(x * 0.3) * Math.cos(y * 0.3) + 
                     Math.sin(x * 0.1 + y * 0.2) * 0.5;
        
        if (noise > 0.8) {
          type = TileType.MOUNTAIN;
          walkable = false;
          cost = 999;
        } else if (noise > 0.6) {
          type = TileType.FOREST;
          walkable = true;
          cost = 2; // Лес замедляет движение
        } else if (noise < -0.7) {
          type = TileType.WATER;
          walkable = false;
          cost = 999;
        } else if (noise < -0.3 && noise > -0.5) {
          type = TileType.ROAD;
          walkable = true;
          cost = 0.5; // Дорога ускоряет движение
        }
        
        this._tiles.set(`${x},${y}`, { x, y, type, walkable, cost });
      }
    }
    
    // Создаем безопасную зону в центре для старта
    const centerX = Math.floor(this._width / 2);
    const centerY = Math.floor(this._height / 2);
    const safeRadius = 5;
    
    for (let dy = -safeRadius; dy <= safeRadius; dy++) {
      for (let dx = -safeRadius; dx <= safeRadius; dx++) {
        const nx = centerX + dx;
        const ny = centerY + dy;
        if (nx >= 0 && nx < this._width && ny >= 0 && ny < this._height) {
          const key = `${nx},${ny}`;
          const tile = this._tiles.get(key);
          if (tile) {
            tile.type = TileType.GRASS;
            tile.walkable = true;
            tile.cost = 1;
          }
        }
      }
    }
  }
  
  /**
   * Получает тайл по координатам
   */
  getTile(x: number, y: number): Tile | null {
    x = Math.floor(x);
    y = Math.floor(y);
    
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      return null;
    }
    
    return this._tiles.get(`${x},${y}`) || null;
  }
  
  /**
   * Проверяет, можно ли пройти через тайл
   */
  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile ? tile.walkable : false;
  }
  
  /**
   * Получает стоимость перемещения через тайл
   */
  getCost(x: number, y: number): number {
    const tile = this.getTile(x, y);
    return tile ? tile.cost : 999;
  }
  
  /**
   * Поиск пути (A* алгоритм)
   */
  findPath(startX: number, startY: number, endX: number, endY: number): Vector2[] | null {
    const start = { x: Math.floor(startX), y: Math.floor(startY) };
    const end = { x: Math.floor(endX), y: Math.floor(endY) };
    
    // Проверка валидности точек
    if (!this.isWalkable(start.x, start.y) || !this.isWalkable(end.x, end.y)) {
      return null;
    }
    
    // Если точки совпадают
    if (start.x === end.x && start.y === end.y) {
      return [start];
    }
    
    // A* алгоритм
    const openSet: Array<{ x: number; y: number; f: number; g: number; parent: any }> = [];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, any>();
    
    openSet.push({ x: start.x, y: start.y, f: 0, g: 0, parent: null });
    
    while (openSet.length > 0) {
      // Находим узел с наименьшим f
      let lowestIndex = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }
      
      const current = openSet[lowestIndex];
      
      // Если достигли цели
      if (current.x === end.x && current.y === end.y) {
        return this._reconstructPath(cameFrom, current);
      }
      
      // Перемещаем текущий узел из open в closed
      openSet.splice(lowestIndex, 1);
      closedSet.add(`${current.x},${current.y}`);
      
      // Проверяем соседей
      const neighbors = this._getNeighbors(current.x, current.y);
      
      for (const neighbor of neighbors) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
          continue;
        }
        
        const cost = this.getCost(neighbor.x, neighbor.y);
        if (cost >= 999) continue; // Непроходимый тайл
        
        const tentativeG = current.g + cost;
        
        // Проверяем, есть ли уже этот сосед в openSet
        const existingNeighbor = openSet.find(
          n => n.x === neighbor.x && n.y === neighbor.y
        );
        
        if (!existingNeighbor) {
          // Новый узел
          const h = this._heuristic(neighbor.x, neighbor.y, end.x, end.y);
          const f = tentativeG + h;
          openSet.push({
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            f: f,
            parent: current
          });
          cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
        } else if (tentativeG < existingNeighbor.g) {
          // Нашли лучший путь
          existingNeighbor.g = tentativeG;
          existingNeighbor.f = tentativeG + this._heuristic(neighbor.x, neighbor.y, end.x, end.y);
          existingNeighbor.parent = current;
          cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
        }
      }
    }
    
    // Путь не найден
    return null;
  }
  
  /**
   * Восстанавливает путь из cameFrom
   */
  private _reconstructPath(
    cameFrom: Map<string, any>, 
    current: { x: number; y: number }
  ): Vector2[] {
    const path: Vector2[] = [current];
    let key = `${current.x},${current.y}`;
    
    while (cameFrom.has(key)) {
      const parent = cameFrom.get(key);
      path.unshift(parent);
      key = `${parent.x},${parent.y}`;
    }
    
    // Сглаживание пути: убираем лишние точки, если можно идти напрямую
    const smoothedPath = this._smoothPath(path);
    
    return smoothedPath;
  }
  
  /**
   * Сглаживает путь, убирая лишние повороты
   */
  private _smoothPath(path: Vector2[]): Vector2[] {
    if (path.length < 3) return path;
    
    const smoothed: Vector2[] = [path[0]];
    let current = path[0];
    
    for (let i = 1; i < path.length; i++) {
      const next = path[i];
      
      // Проверяем, можно ли перейти от current напрямую к следующему после next
      if (i + 1 < path.length) {
        const afterNext = path[i + 1];
        
        // Если можно идти напрямую от current к afterNext (проверяем проходимость)
        if (this._canSee(current, afterNext)) {
          // Пропускаем next, продолжаем искать дальше
          continue;
        }
      }
      
      smoothed.push(next);
      current = next;
    }
    
    // Добавляем последнюю точку если её нет
    if (smoothed[smoothed.length - 1].x !== path[path.length - 1].x ||
        smoothed[smoothed.length - 1].y !== path[path.length - 1].y) {
      smoothed.push(path[path.length - 1]);
    }
    
    return smoothed;
  }
  
  /**
   * Проверяет, видна ли точка B из точки A (нет ли препятствий)
   */
  private _canSee(a: Vector2, b: Vector2): boolean {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 1.1) return true; // Слишком близко
    
    const steps = Math.ceil(dist);
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    let x = a.x;
    let y = a.y;
    
    for (let i = 0; i <= steps; i++) {
      const tile = this.getTile(Math.round(x), Math.round(y));
      if (!tile || !tile.walkable) {
        return false;
      }
      x += stepX;
      y += stepY;
    }
    
    return true;
  }
  
  /**
   * Эвристика для A* (Манхэттенское расстояние)
   */
  private _heuristic(ax: number, ay: number, bx: number, by: number): number {
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }
  
  /**
   * Получает соседей тайла (8 направлений)
   */
  private _getNeighbors(x: number, y: number): Vector2[] {
    const neighbors: Vector2[] = [];
    const directions = [
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
      { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
    ];
    
    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      if (nx >= 0 && nx < this._width && ny >= 0 && ny < this._height) {
        neighbors.push({ x: nx, y: ny });
      }
    }
    
    return neighbors;
  }
  
  /**
   * Получает размеры карты
   */
  getDimensions(): { width: number; height: number } {
    return { width: this._width, height: this._height };
  }
  
  /**
   * Получает все тайлы для рендеринга
   */
  getAllTiles(): Tile[] {
    return Array.from(this._tiles.values());
  }
}
