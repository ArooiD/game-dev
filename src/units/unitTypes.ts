export type UnitKind = 'worker' | 'soldier' | 'specialist' | 'cavalry' | 'artillery';

export type UnitAnimationState = 'idle' | 'walk' | 'attack' | 'death';

export type UnitModel = {
  body: 'human' | 'horse' | 'cannon';
  portrait: string;
  idleFrames: number;
  walkFrames: number;
  attackFrames: number;
};

export type UnitSpec = {
  label: string;
  short: string;
  color: number;
  width: number;
  height: number;
  speed: number;
  hp: number;
  morale: number;
  ammo: number;
  range: number;
  damage: number;
  moraleDamage: number;
  reloadMs: number;
  model: UnitModel;
};

export const UNIT_SPECS: Record<UnitKind, UnitSpec> = {
  worker: { label: 'Рабочий', short: 'W', color: 0x22c55e, width: 12, height: 12, speed: 52, hp: 70, morale: 70, ammo: 0, range: 0, damage: 4, moraleDamage: 2, reloadMs: 1000, model: { body: 'human', portrait: 'worker', idleFrames: 2, walkFrames: 6, attackFrames: 2 } },
  soldier: { label: 'Воин', short: 'S', color: 0x2563eb, width: 14, height: 14, speed: 58, hp: 100, morale: 100, ammo: 12, range: 240, damage: 24, moraleDamage: 12, reloadMs: 1400, model: { body: 'human', portrait: 'soldier', idleFrames: 2, walkFrames: 6, attackFrames: 4 } },
  specialist: { label: 'Специалист', short: 'P', color: 0xa855f7, width: 13, height: 13, speed: 62, hp: 85, morale: 120, ammo: 18, range: 280, damage: 18, moraleDamage: 20, reloadMs: 1100, model: { body: 'human', portrait: 'specialist', idleFrames: 2, walkFrames: 6, attackFrames: 4 } },
  cavalry: { label: 'Кавалерия', short: 'C', color: 0xf59e0b, width: 20, height: 12, speed: 105, hp: 130, morale: 115, ammo: 6, range: 120, damage: 32, moraleDamage: 22, reloadMs: 1250, model: { body: 'horse', portrait: 'cavalry', idleFrames: 2, walkFrames: 8, attackFrames: 4 } },
  artillery: { label: 'Артиллерия', short: 'A', color: 0x64748b, width: 24, height: 18, speed: 28, hp: 160, morale: 90, ammo: 8, range: 520, damage: 70, moraleDamage: 40, reloadMs: 3200, model: { body: 'cannon', portrait: 'artillery', idleFrames: 1, walkFrames: 3, attackFrames: 3 } },
};
