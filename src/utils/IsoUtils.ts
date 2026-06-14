/**
 * Утилиты для преобразования координат
 * 
 * Простой вид сверху (top-down) без изометрии
 */

import { Vector2, WorldPosition } from '../types.js';

export class IsoUtils {
  // Размер тайла для отрисовки (квадратный для top-down)
  static readonly TILE_WIDTH = 64;
  static readonly TILE_HEIGHT = 64;
  
  /**
   * Преобразует координаты сетки в экранные координаты
   */
  static gridToScreen(gridX: number, gridY: number): Vector2 {
    const x = gridX * IsoUtils.TILE_WIDTH;
    const y = gridY * IsoUtils.TILE_HEIGHT;
    return { x, y };
  }
  
  /**
   * Преобразует экранные координаты в координаты сетки
   */
  static screenToGrid(screenX: number, screenY: number): Vector2 {
    const gridX = screenX / IsoUtils.TILE_WIDTH;
    const gridY = screenY / IsoUtils.TILE_HEIGHT;
    return { x: gridX, y: gridY };
  }
  
  /**
   * Преобразует мировые координаты в экранные с учётом камеры
   */
  static worldToScreen(
    worldPos: WorldPosition,
    cameraPos: Vector2,
    centerX: number,
    centerY: number
  ): Vector2 {
    const screenX = (worldPos.x - cameraPos.x) * IsoUtils.TILE_WIDTH + centerX;
    const screenY = (worldPos.y - cameraPos.y) * IsoUtils.TILE_HEIGHT + centerY;
    return { x: screenX, y: screenY };
  }
  
  /**
   * Получает глубину для сортирования (для top-down просто Y координата)
   */
  static getDepth(_gridX: number, gridY: number, _z: number = 0): number {
    return gridY;
  }
  
  /**
   * Проверяет, находится ли точка внутри тайла
   */
  static isPointInTile(screenX: number, screenY: number, tileX: number, tileY: number): boolean {
    const startX = tileX * IsoUtils.TILE_WIDTH;
    const startY = tileY * IsoUtils.TILE_HEIGHT;
    
    return (
      screenX >= startX &&
      screenX < startX + IsoUtils.TILE_WIDTH &&
      screenY >= startY &&
      screenY < startY + IsoUtils.TILE_HEIGHT
    );
  }
  
  /**
   * Получает размер карты в пикселях
   */
  static getMapSize(gridWidth: number, gridHeight: number): Vector2 {
    return {
      x: gridWidth * IsoUtils.TILE_WIDTH,
      y: gridHeight * IsoUtils.TILE_HEIGHT
    };
  }
}
