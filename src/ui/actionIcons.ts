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
  description: string;
};

export const WORKER_ACTIONS: CommandAction[] = [
  { id: 'build_house', label: 'Дом', hotkey: 'H', icon: 'house', description: 'Построить дом. Увеличивает лимит населения.' },
  { id: 'build_barracks', label: 'Казармы', hotkey: 'B', icon: 'barracks', description: 'Построить казармы. Открывают производство воинов и специалистов.' },
  { id: 'build_stable', label: 'Конюшня', hotkey: 'S', icon: 'stable', description: 'Построить конюшню. Производит кавалерию.' },
  { id: 'build_foundry', label: 'Литейная', hotkey: 'F', icon: 'foundry', description: 'Построить литейную. Производит артиллерию.' },
  { id: 'repair', label: 'Ремонт', hotkey: 'R', icon: 'repair', description: 'Отправить рабочего ремонтировать повреждённое здание.' },
  { id: 'gather', label: 'Добыча', hotkey: 'G', icon: 'gather', description: 'Назначить рабочего на добычу ближайшего ресурса.' },
  { id: 'stop', label: 'Стоп', hotkey: 'X', icon: 'stop', description: 'Остановить текущую задачу выбранных рабочих.' },
];

export const MILITARY_ACTIONS: CommandAction[] = [
  { id: 'attack', label: 'Атака', hotkey: 'A', icon: 'attack', description: 'Перейти в режим атаки выбранными боевыми юнитами.' },
  { id: 'hold', label: 'Держать', hotkey: 'H', icon: 'hold', description: 'Удерживать позицию и не преследовать цель.' },
  { id: 'stop', label: 'Стоп', hotkey: 'X', icon: 'stop', description: 'Остановить движение и текущий приказ.' },
];

export const BUILDING_ACTIONS: CommandAction[] = [
  { id: 'train_worker', label: 'Рабочий', hotkey: 'T', icon: 'worker', description: 'Произвести рабочего. Доступно только в ратуше.' },
  { id: 'train_soldier', label: 'Воин', hotkey: 'Q', icon: 'soldier', description: 'Произвести линейного солдата. Доступно в казармах.' },
  { id: 'train_specialist', label: 'Спец.', hotkey: 'E', icon: 'specialist', description: 'Произвести специалиста дальнего боя. Доступно в казармах.' },
  { id: 'train_cavalry', label: 'Кав.', hotkey: 'C', icon: 'cavalry', description: 'Произвести кавалерию. Доступно в конюшне.' },
  { id: 'train_artillery', label: 'Арт.', hotkey: 'A', icon: 'artillery', description: 'Произвести артиллерию. Доступно в литейной.' },
];
