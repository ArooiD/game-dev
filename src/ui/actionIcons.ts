export type CommandActionId =
  | 'build_house'
  | 'build_barracks'
  | 'build_stable'
  | 'build_foundry'
  | 'repair'
  | 'gather'
  | 'stop'
  | 'attack'
  | 'hold'
  | 'train_worker'
  | 'train_soldier'
  | 'train_specialist'
  | 'train_cavalry'
  | 'train_artillery';

export type ActionIconKind = 'hammer' | 'house' | 'barracks' | 'stable' | 'foundry' | 'repair' | 'gather' | 'stop' | 'attack' | 'hold' | 'worker' | 'soldier' | 'specialist' | 'cavalry' | 'artillery';

export type CommandAction = {
  id: CommandActionId;
  label: string;
  hotkey: string;
  icon: ActionIconKind;
};

export const WORKER_ACTIONS: CommandAction[] = [
  { id: 'build_house', label: 'Дом', hotkey: 'H', icon: 'house' },
  { id: 'build_barracks', label: 'Казармы', hotkey: 'B', icon: 'barracks' },
  { id: 'build_stable', label: 'Конюшня', hotkey: 'S', icon: 'stable' },
  { id: 'build_foundry', label: 'Литейная', hotkey: 'F', icon: 'foundry' },
  { id: 'repair', label: 'Ремонт', hotkey: 'R', icon: 'repair' },
  { id: 'gather', label: 'Добыча', hotkey: 'G', icon: 'gather' },
  { id: 'stop', label: 'Стоп', hotkey: 'X', icon: 'stop' },
];

export const MILITARY_ACTIONS: CommandAction[] = [
  { id: 'attack', label: 'Атака', hotkey: 'A', icon: 'attack' },
  { id: 'hold', label: 'Держать', hotkey: 'H', icon: 'hold' },
  { id: 'stop', label: 'Стоп', hotkey: 'X', icon: 'stop' },
];

export const BUILDING_ACTIONS: CommandAction[] = [
  { id: 'train_worker', label: 'Рабочий', hotkey: 'T', icon: 'worker' },
  { id: 'train_soldier', label: 'Воин', hotkey: 'Q', icon: 'soldier' },
  { id: 'train_specialist', label: 'Спец.', hotkey: 'E', icon: 'specialist' },
  { id: 'train_cavalry', label: 'Кав.', hotkey: 'C', icon: 'cavalry' },
  { id: 'train_artillery', label: 'Арт.', hotkey: 'A', icon: 'artillery' },
];
