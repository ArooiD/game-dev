import type { CampaignState } from './types';

export const europeCampaignState: CampaignState = {
  turn: 1,
  activeFaction: 'blue',
  selectedRegionId: null,
  selectedArmyId: null,
  resources: {
    blue: { food: 1600, wood: 900, iron: 620, gold: 720 },
    red: { food: 1500, wood: 820, iron: 760, gold: 680 },
  },
  regions: [
    { id: 'britain', name: 'Британия', x: 180, y: 180, owner: 'neutral', income: { food: 90, wood: 80, iron: 70, gold: 150 }, garrison: 180, neighbors: ['france', 'low_countries'] },
    { id: 'france', name: 'Франция', x: 300, y: 330, owner: 'blue', income: { food: 190, wood: 90, iron: 90, gold: 160 }, garrison: 260, neighbors: ['britain', 'spain', 'low_countries', 'germany', 'italy'] },
    { id: 'spain', name: 'Испания', x: 210, y: 520, owner: 'blue', income: { food: 150, wood: 60, iron: 70, gold: 130 }, garrison: 170, neighbors: ['france', 'italy'] },
    { id: 'low_countries', name: 'Нидерланды', x: 390, y: 250, owner: 'neutral', income: { food: 80, wood: 50, iron: 60, gold: 180 }, garrison: 140, neighbors: ['britain', 'france', 'germany'] },
    { id: 'germany', name: 'Германия', x: 500, y: 310, owner: 'neutral', income: { food: 140, wood: 120, iron: 160, gold: 110 }, garrison: 240, neighbors: ['france', 'low_countries', 'scandinavia', 'poland', 'austria', 'italy'] },
    { id: 'italy', name: 'Италия', x: 500, y: 500, owner: 'blue', income: { food: 120, wood: 50, iron: 80, gold: 170 }, garrison: 160, neighbors: ['france', 'spain', 'germany', 'austria', 'balkans'] },
    { id: 'scandinavia', name: 'Скандинавия', x: 560, y: 120, owner: 'neutral', income: { food: 70, wood: 170, iron: 130, gold: 70 }, garrison: 150, neighbors: ['germany', 'poland', 'russia'] },
    { id: 'poland', name: 'Польша', x: 690, y: 300, owner: 'red', income: { food: 150, wood: 100, iron: 130, gold: 90 }, garrison: 220, neighbors: ['germany', 'scandinavia', 'russia', 'austria'] },
    { id: 'austria', name: 'Австрия', x: 640, y: 430, owner: 'red', income: { food: 130, wood: 110, iron: 140, gold: 110 }, garrison: 260, neighbors: ['germany', 'italy', 'poland', 'balkans'] },
    { id: 'balkans', name: 'Балканы', x: 730, y: 560, owner: 'red', income: { food: 140, wood: 80, iron: 90, gold: 100 }, garrison: 210, neighbors: ['italy', 'austria', 'ottomans', 'russia'] },
    { id: 'ottomans', name: 'Османы', x: 900, y: 640, owner: 'red', income: { food: 160, wood: 80, iron: 100, gold: 160 }, garrison: 280, neighbors: ['balkans', 'russia'] },
    { id: 'russia', name: 'Россия', x: 930, y: 280, owner: 'red', income: { food: 220, wood: 180, iron: 190, gold: 140 }, garrison: 340, neighbors: ['scandinavia', 'poland', 'balkans', 'ottomans'] },
  ],
  armies: [
    { id: 'blue-west', name: 'Западная армия', faction: 'blue', regionId: 'france', infantry: 260, cavalry: 60, artillery: 12 },
    { id: 'blue-south', name: 'Средиземный корпус', faction: 'blue', regionId: 'italy', infantry: 160, cavalry: 36, artillery: 8 },
    { id: 'red-central', name: 'Центральная армия', faction: 'red', regionId: 'austria', infantry: 240, cavalry: 54, artillery: 12 },
    { id: 'red-east', name: 'Восточная армия', faction: 'red', regionId: 'russia', infantry: 320, cavalry: 70, artillery: 14 },
  ],
};
