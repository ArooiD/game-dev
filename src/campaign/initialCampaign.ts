import type { CampaignState } from './types';

export const initialCampaignState: CampaignState = {
  turn: 1,
  activeFaction: 'blue',
  selectedRegionId: null,
  selectedArmyId: null,
  resources: {
    blue: { food: 1200, wood: 900, iron: 420, gold: 360 },
    red: { food: 1100, wood: 760, iron: 500, gold: 420 },
  },
  regions: [
    { id: 'capital', name: 'Столица', x: 430, y: 310, owner: 'blue', income: { food: 120, wood: 80, iron: 30, gold: 60 }, garrison: 220, neighbors: ['north_forest', 'river_crossing', 'southern_fields'] },
    { id: 'north_forest', name: 'Северный лес', x: 330, y: 170, owner: 'blue', income: { food: 50, wood: 150, iron: 20, gold: 20 }, garrison: 90, neighbors: ['capital', 'river_crossing', 'western_port'] },
    { id: 'river_crossing', name: 'Речной переход', x: 620, y: 250, owner: 'neutral', income: { food: 70, wood: 60, iron: 50, gold: 40 }, garrison: 120, neighbors: ['capital', 'north_forest', 'iron_hills', 'eastern_fort'] },
    { id: 'iron_hills', name: 'Железные холмы', x: 820, y: 150, owner: 'red', income: { food: 30, wood: 40, iron: 170, gold: 40 }, garrison: 180, neighbors: ['river_crossing', 'eastern_fort'] },
    { id: 'southern_fields', name: 'Южные поля', x: 520, y: 520, owner: 'blue', income: { food: 180, wood: 40, iron: 20, gold: 25 }, garrison: 110, neighbors: ['capital', 'borderlands'] },
    { id: 'eastern_fort', name: 'Восточный форт', x: 900, y: 340, owner: 'red', income: { food: 80, wood: 70, iron: 90, gold: 70 }, garrison: 260, neighbors: ['river_crossing', 'iron_hills', 'borderlands'] },
    { id: 'western_port', name: 'Западный порт', x: 170, y: 360, owner: 'neutral', income: { food: 80, wood: 90, iron: 20, gold: 120 }, garrison: 140, neighbors: ['north_forest', 'capital'] },
    { id: 'borderlands', name: 'Пограничье', x: 750, y: 560, owner: 'red', income: { food: 90, wood: 50, iron: 70, gold: 50 }, garrison: 170, neighbors: ['southern_fields', 'eastern_fort'] },
  ],
  armies: [
    { id: 'blue-main', name: '1-я армия', faction: 'blue', regionId: 'capital', infantry: 180, cavalry: 40, artillery: 8 },
    { id: 'blue-south', name: 'Южный корпус', faction: 'blue', regionId: 'southern_fields', infantry: 110, cavalry: 24, artillery: 4 },
    { id: 'red-main', name: 'Имперская армия', faction: 'red', regionId: 'eastern_fort', infantry: 210, cavalry: 52, artillery: 10 },
    { id: 'red-north', name: 'Северный корпус', faction: 'red', regionId: 'iron_hills', infantry: 130, cavalry: 30, artillery: 6 },
  ],
};
