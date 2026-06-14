/**
 * Обработчик ввода - мышь, клавиатура, выделение рамкой
 */

import { Vector2 } from '../types.js';

export class InputHandler {
  // Состояние мыши
  mousePosition: Vector2 = { x: 0, y: 0 };
  mouseDown: boolean = false;
  mouseButtonDown: { [key: number]: boolean } = {};
  
  // Выделение рамкой
  selectionStart: Vector2 | null = null;
  selectionEnd: Vector2 | null = null;
  isSelecting: boolean = false;
  
  // Скролл
  scrollSensitivity: number = 0.1;
  
  // Движение камеры по краям экрана
  cameraMoveSpeed: number = 10;
  cameraEdgeSize: number = 20;
  
  // Callbacks
  onSelectionStart?: (pos: Vector2) => void;
  onSelectionEnd?: (pos: Vector2) => void;
  onSelectionChange?: (start: Vector2, end: Vector2) => void;
  onClick?: (pos: Vector2, button: number) => void;
  onDoubleClick?: (pos: Vector2) => void;
  onMoveCommand?: (pos: Vector2) => void;
  onAttackCommand?: (pos: Vector2) => void;
  onScroll?: (delta: number) => void;
  onKey?: (key: string, pressed: boolean) => void;
  
  constructor() {
    this._setupEventListeners();
  }
  
  /**
   * Настраивает обработчики событий
   */
  private _setupEventListeners(): void {
    // Ждем пока canvas будет добавлен в DOM
    const getCanvas = () => document.querySelector('canvas');
    
    const attachListeners = () => {
      const canvas = getCanvas();
      if (!canvas) return false;
      
      // Движение мыши
      canvas.addEventListener('mousemove', (e) => {
        this.mousePosition = { x: e.clientX, y: e.clientY };
        
        if (this.isSelecting) {
          this.selectionEnd = { x: e.clientX, y: e.clientY };
          if (this.onSelectionChange && this.selectionStart) {
            this.onSelectionChange(this.selectionStart, this.selectionEnd);
          }
        }
      });
      
      // Нажатие кнопки мыши
      canvas.addEventListener('mousedown', (e) => {
        this.mouseButtonDown[e.button] = true;
        this.mouseDown = true;
        
        if (e.button === 0) { // Левая кнопка - выделение
          if (!this.isSelecting) {
            this.isSelecting = true;
            this.selectionStart = { x: e.clientX, y: e.clientY };
            this.selectionEnd = { x: e.clientX, y: e.clientY };
            if (this.onSelectionStart) {
              this.onSelectionStart(this.selectionStart);
            }
          }
        } else if (e.button === 2) { // Правая кнопка - команда
          e.preventDefault();
          if (this.onMoveCommand) {
            this.onMoveCommand(this.mousePosition);
          }
        }
        
        if (this.onClick) {
          this.onClick(this.mousePosition, e.button);
        }
      });
      
      // Отпускание кнопки мыши
      canvas.addEventListener('mouseup', (e) => {
        this.mouseButtonDown[e.button] = false;
        
        if (e.button === 0 && this.isSelecting) {
          this.isSelecting = false;
          this.selectionEnd = { x: e.clientX, y: e.clientY };
          if (this.onSelectionEnd) {
            this.onSelectionEnd(this.selectionEnd);
          }
          this.selectionStart = null;
          this.selectionEnd = null;
        }
        
        if (e.button === 2) {
          this.mouseDown = false;
        }
      });
      
      // Скролл (отключён)
      // canvas.addEventListener('wheel', (e) => {
      //   e.preventDefault();
      //   const delta = e.deltaY > 0 ? -this.scrollSensitivity : this.scrollSensitivity;
      //   if (this.onScroll) {
      //     this.onScroll(delta);
      //   }
      // }, { passive: false });
      
      // Контекстное меню (отключаем)
      canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      
      return true;
    };
    
    // Клавиатура (глобально)
    window.addEventListener('keydown', (e) => {
      if (this.onKey) {
        this.onKey(e.key, true);
      }
    });
    
    window.addEventListener('keyup', (e) => {
      if (this.onKey) {
        this.onKey(e.key, false);
      }
    });
    
    // Пробуем сразу
    if (!attachListeners()) {
      // Если не получилось, ждем пока canvas появится
      const checkInterval = setInterval(() => {
        if (attachListeners()) {
          clearInterval(checkInterval);
        }
      }, 100);
      
      // Timeout через 5 секунд
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);
    }
  }
  
  /**
   * Проверяет, нажата ли кнопка мыши
   */
  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtonDown[button] === true;
  }
  
  /**
   * Получает выделенную область
   */
  getSelectionBox(): { start: Vector2; end: Vector2 } | null {
    if (!this.selectionStart || !this.selectionEnd) {
      return null;
    }
    
    return {
      start: this.selectionStart,
      end: this.selectionEnd,
    };
  }
  
  /**
   * Проверяет, что точка внутри выделения
   */
  isPointInSelection(point: Vector2): boolean {
    const selection = this.getSelectionBox();
    if (!selection) return false;
    
    const minX = Math.min(selection.start.x, selection.end.x);
    const maxX = Math.max(selection.start.x, selection.end.x);
    const minY = Math.min(selection.start.y, selection.end.y);
    const maxY = Math.max(selection.start.y, selection.end.y);
    
    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
  }
  
  /**
   * Сбрасывает выделение
   */
  clearSelection(): void {
    this.isSelecting = false;
    this.selectionStart = null;
    this.selectionEnd = null;
  }
  
  /**
   * Получает смещение для движения камеры
   */
  getCameraMoveDelta(screenWidth: number, screenHeight: number): Vector2 {
    let dx = 0;
    let dy = 0;
    
    if (this.mousePosition.x < this.cameraEdgeSize) {
      dx = -this.cameraMoveSpeed;
    } else if (this.mousePosition.x > screenWidth - this.cameraEdgeSize) {
      dx = this.cameraMoveSpeed;
    }
    
    if (this.mousePosition.y < this.cameraEdgeSize) {
      dy = -this.cameraMoveSpeed;
    } else if (this.mousePosition.y > screenHeight - this.cameraEdgeSize) {
      dy = this.cameraMoveSpeed;
    }
    
    return { x: dx, y: dy };
  }
}
