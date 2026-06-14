/**
 * Игровой цикл - управляет обновлением и отрисовкой
 */

export class GameLoop {
  private _isRunning: boolean = false;
  private _lastTime: number = 0;
  private _deltaTime: number = 0;
  private _fixedDeltaTime: number = 1 / 60;
  private _accumulator: number = 0;
  
  // Callbacks
  onUpdate?: (deltaTime: number) => void;
  onFixedUpdate?: () => void;
  onRender?: () => void;
  
  // Статистика
  fps: number = 0;
  frames: number = 0;
  lastFpsUpdate: number = 0;
  
  /**
   * Запускает игровой цикл
   */
  start(): void {
    if (this._isRunning) return;
    
    this._isRunning = true;
    this._lastTime = performance.now();
    this._loop();
  }
  
  /**
   * Останавливает игровой цикл
   */
  stop(): void {
    this._isRunning = false;
  }
  
  /**
   * Проверяет запущен ли цикл
   */
  isRunning(): boolean {
    return this._isRunning;
  }
  
  /**
   * Основной цикл
   */
  private _loop(): void {
    if (!this._isRunning) return;
    
    requestAnimationFrame((_time) => this._loop());
    
    // Вычисляем deltaTime
    const currentTime = performance.now();
    this._deltaTime = Math.min((currentTime - this._lastTime) / 1000, 0.1);
    this._lastTime = currentTime;
    
    // Обновляем FPS
    this._updateFps(currentTime);
    
    // Fixed update (физика, логика)
    this._accumulator += this._deltaTime;
    while (this._accumulator >= this._fixedDeltaTime) {
      if (this.onFixedUpdate) {
        this.onFixedUpdate();
      }
      this._accumulator -= this._fixedDeltaTime;
    }
    
    // Update (логика игры)
    if (this.onUpdate) {
      this.onUpdate(this._deltaTime);
    }
    
    // Render
    if (this.onRender) {
      this.onRender();
    }
  }
  
  /**
   * Обновляет статистику FPS
   */
  private _updateFps(currentTime: number): void {
    this.frames++;
    
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frames;
      this.frames = 0;
      this.lastFpsUpdate = currentTime;
    }
  }
  
  /**
   * Получает deltaTime
   */
  getDeltaTime(): number {
    return this._deltaTime;
  }
  
  /**
   * Получает fixedDeltaTime
   */
  getFixedDeltaTime(): number {
    return this._fixedDeltaTime;
  }
  
  /**
   * Устанавливает fixedDeltaTime
   */
  setFixedDeltaTime(dt: number): void {
    this._fixedDeltaTime = dt;
  }
}
