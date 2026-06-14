/**
 * Утилиты для изометрического преобразования координат
 * 
 * Изометрическая проекция использует угол 2:1 (примерно 26.565°)
 * для создания псевдо-3D эффекта
 */

import { Vector2, WorldPosition } from '../types.js';

export class IsoUtils {
  // Угол изометрии (2:1 соотношение)
  static readonly ISO_ANGLE = Math.atan(0.5);
  
  // Виртуальный размер тайла для логики (мелкая сетка)
  static readonly LOGIC_TILE_WIDTH = 1.0;  // Базовая единица для логики
  static readonly LOGIC_TILE_HEIGHT = 1.0;
  
  // Визуальный размер тайла для отрисовки (крупные тайлы)
  static readonly TILE_WIDTH = 64;  // Вернул оригинальный размер
  static readonly TILE_HEIGHT = 32;
  
  // Масштаб отрисовки относительно логики
  static readonly RENDER_SCALE = IsoUtils.TILE_WIDTH / IsoUtils.LOGIC_TILE_WIDTH;
  
  /**
   * Преобразует координаты сетки в экранные координаты
   * @param gridX - X координата в сетке
   * @param gridY - Y координата в сетке
   * @returns Экранная позиция
   */
  static gridToScreen(gridX: number, gridY: number): Vector2 {
    const x = (gridX - gridY) * (IsoUtils.TILE_WIDTH / 2);
    const y = (gridX + gridY) * (IsoUtils.TILE_HEIGHT / 2);
    return { x, y };
  }
  
  /**
   * Преобразует экранные координаты в координаты сетки
   * @param screenX - X координата на экране
   * @param screenY - Y координата на экране
   * @returns Позиция в сетке
   */
  static screenToGrid(screenX: number, screenY: number): Vector2 {
    const halfTileWidth = IsoUtils.TILE_WIDTH / 2;
    const halfTileHeight = IsoUtils.TILE_HEIGHT / 2;
    
    const gridY = (screenY / halfTileHeight - screenX / halfTileWidth) / 2;
    const gridX = (screenY / halfTileHeight + screenX / halfTileWidth) / 2;
    
    return { x: gridX, y: gridY };
  }
  
  /**
   * Преобразует мировые координаты в экранные с учётом камеры
   * @param worldPos - Мировая позиция
   * @param cameraPos - Позиция камеры
   * @param centerX - Центр экрана по X
   * @param centerY - Центр экрана по Y
   * @returns Экранная позиция
   */
  static worldToScreen(
    worldPos: WorldPosition,
    cameraPos: Vector2,
    centerX: number,
    centerY: number
  ): Vector2 {
    const isoPos = IsoUtils.gridToScreen(worldPos.x, worldPos.y);
    
    // Добавляем высоту (Z-координату)
    isoPos.y -= worldPos.z;
    
    // Применяем смещение камеры
    isoPos.x -= cameraPos.x;
    isoPos.y -= cameraPos.y;
    
    // Центрируем на экране
    isoPos.x += centerX;
    isoPos.y += centerY;
    
    return isoPos;
  }
  
  /**
   * Получает глубину тайла для правильного сортирования (z-index)
   * @param gridX - X координата в сетке
   * @param gridY - Y координата в сетке
   * @param z - Высота
   * @returns Значение для сортировки
   */
  static getDepth(gridX: number, gridY: number, z: number = 0): number {
    return gridX + gridY - z;
  }
  
  /**
   * Проверяет, находится ли точка внутри изометрического тайла
   * @param screenX - Экранная X
   * @param screenY - Экранная Y
   * @param tileX - X тайла в сетке
   * @param tileY - Y тайла в сетке
   * @returns true если точка внутри тайла
   */
  static isPointInTile(screenX: number, screenY: number, tileX: number, tileY: number): boolean {
    const center = IsoUtils.gridToScreen(tileX, tileY);
    const halfWidth = IsoUtils.TILE_WIDTH / 2;
    const halfHeight = IsoUtils.TILE_HEIGHT / 2;
    
    const dx = screenX - center.x;
    const dy = screenY - center.y;
    
    // Проверка с использованием ромбовидной формы
    return Math.abs(dx / halfWidth) + Math.abs(dy / halfHeight) <= 1;
  }
  
  /**
   * Получает размер изометрической карты в пикселях
   * @param gridWidth - Ширина карты в тайлах
   * @param gridHeight - Высота карты в тайлах
   * @returns Размеры в пикселях
   */
  static getMapSize(gridWidth: number, gridHeight: number): Vector2 {
    const width = (gridWidth + gridHeight) * (IsoUtils.TILE_WIDTH / 2);
    const height = (gridWidth + gridHeight) * (IsoUtils.TILE_HEIGHT / 2);
    return { x: width, y: height };
  }
}
