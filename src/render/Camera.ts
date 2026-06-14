/**
 * Изометрическая камера - управляет видом и позиционированием
 */

import { Vector2 } from '../types.js';
import { IsoUtils } from '../utils/IsoUtils.js';

export class Camera {
  // Позиция камеры в мировых координатах
  position: Vector2;
  
  // Зум (масштаб)
  zoom: number;
  
  // Ограничения движения камеры
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null = null;
  
  // Плавное движение
  private _targetPosition: Vector2 | null = null;
  private _smoothSpeed: number = 0.1;
  
  constructor(position: Vector2 = { x: 0, y: 0 }) {
    this.position = { ...position };
    this.zoom = 1; // Фиксированный зум 1.0 (отключён)
  }
  
  /**
   * Перемещает камеру
   */
  move(deltaX: number, deltaY: number): void {
    this.position.x += deltaX;
    this.position.y += deltaY;
    this._targetPosition = null;
    this._clampToBounds();
  }
  
  /**
   * Устанавливает целевую позицию для плавного перемещения
   */
  moveTo(target: Vector2, smooth: boolean = true): void {
    if (smooth) {
      this._targetPosition = { ...target };
    } else {
      this.position = { ...target };
      this._targetPosition = null;
      this._clampToBounds();
    }
  }
  
  /**
   * Центрирует камеру на точке
   */
  centerOn(worldX: number, worldY: number): void {
    this.moveTo({ x: worldX, y: worldY });
  }
  
  /**
   * Обновляет камеру (обработка плавного движения)
   */
  update(): void {
    if (this._targetPosition) {
      // Плавное перемещение к цели
      this.position.x += (this._targetPosition.x - this.position.x) * this._smoothSpeed;
      this.position.y += (this._targetPosition.y - this.position.y) * this._smoothSpeed;
      
      // Если близко к цели, останавливаемся
      const dx = this.position.x - this._targetPosition.x;
      const dy = this.position.y - this._targetPosition.y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.1) {
        this.position = { ...this._targetPosition };
        this._targetPosition = null;
      }
      
      this._clampToBounds();
    }
  }
  
  /**
   * Устанавливает скорость плавного движения
   */
  setSmoothSpeed(speed: number): void {
    this._smoothSpeed = Math.max(0.01, Math.min(1, speed));
  }
  
  /**
   * Устанавливает границы карты
   */
  setBounds(minX: number, maxX: number, minY: number, maxY: number): void {
    this.bounds = { minX, maxX, minY, maxY };
    this._clampToBounds();
  }
  
  /**
   * Преобразует экранные координаты в мировые
   */
  screenToWorld(screenX: number, screenY: number, centerX: number, centerY: number): Vector2 {
    // Сначала убираем зум и центрирование
    const unzoomedX = (screenX - centerX) / this.zoom + centerX;
    const unzoomedY = (screenY - centerY) / this.zoom + centerY;
    
    // Затем применяем обратное смещение камеры
    const isoX = unzoomedX - centerX + this.position.x;
    const isoY = unzoomedY - centerY + this.position.y;
    
    // Преобразуем изометрические координаты в сетку
    const gridPos = IsoUtils.screenToGrid(isoX, isoY);
    
    return gridPos;
  }
  
  /**
   * Преобразует мировые координаты в экранные
   */
  worldToScreen(worldX: number, worldY: number, centerX: number, centerY: number): Vector2 {
    // Используем IsoUtils.worldToScreen с z=0 (без зума)
    return IsoUtils.worldToScreen(
      { x: worldX, y: worldY, z: 0 },
      this.position,
      centerX,
      centerY
    );
  }
  
  /**
   * Получает видимую область в мировых координатах
   */
  getVisibleBounds(screenWidth: number, screenHeight: number): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    const halfWidth = screenWidth / 2 / this.zoom;
    const halfHeight = screenHeight / 2 / this.zoom;
    
    return {
      minX: this.position.x - halfWidth,
      maxX: this.position.x + halfWidth,
      minY: this.position.y - halfHeight,
      maxY: this.position.y + halfHeight,
    };
  }
  
  /**
   * Зумирует камеру
   */
  zoomBy(delta: number): void {
    this.zoom = Math.max(0.1, Math.min(3, this.zoom + delta));
  }
  
  /**
   * Ограничивает позицию камеры границами
   */
  private _clampToBounds(): void {
    if (!this.bounds) return;
    
    this.position.x = Math.max(
      this.bounds.minX,
      Math.min(this.bounds.maxX, this.position.x)
    );
    this.position.y = Math.max(
      this.bounds.minY,
      Math.min(this.bounds.maxY, this.position.y)
    );
  }
}
