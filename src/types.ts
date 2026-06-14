// Базовые типы для 2.5D RTS

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Изометрические координаты
export interface IsoPoint {
  screenX: number;
  screenY: number;
  gridX: number;
  gridY: number;
}

// Позиция сущности в мире
export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

// Размеры сущности
export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

// Цвет в формате RGBA
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Состояние игры
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
}

// Типы сущностей
export enum EntityType {
  UNIT = 'unit',
  SQUAD = 'squad',
  BUILDING = 'building',
  PROJECTILE = 'projectile',
  DECORATION = 'decoration',
}

// Типы юнитов
export enum UnitType {
  INFANTRY = 'infantry',
  CAVALRY = 'cavalry',
  ARTILLERY = 'artillery',
  ARCHER = 'archer',
}

// Типы зданий
export enum BuildingType {
  TOWN_CENTER = 'town_center',
  BARRACKS = 'barracks',
  STABLE = 'stable',
  ARTILLERY_FOUNDRY = 'artillery_foundry',
  WALL = 'wall',
}

// Команды для юнитов
export enum CommandType {
  MOVE = 'move',
  ATTACK = 'attack',
  STOP = 'stop',
  FORMATION = 'formation',
  PATROL = 'patrol',
}

// Типы формаций
export enum FormationType {
  LINE = 'line',
  COLUMN = 'column',
  SQUARE = 'square',
  WEDGE = 'wedge',
}

// Ресурсы
export interface Resources {
  food: number;
  wood: number;
  iron: number;
  gold: number;
  population: number;
  populationLimit: number;
}

// Статистика юнита
export interface UnitStats {
  health: number;
  maxHealth: number;
  morale: number;
  maxMorale: number;
  stamina: number;
  maxStamina: number;
  ammo: number;
  maxAmmo: number;
  damage: number;
  range: number;
  attackSpeed: number;
  moveSpeed: number;
  reloadTime: number;
}
