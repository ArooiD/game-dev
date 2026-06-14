export type FactionId = 'blue' | 'red' | 'neutral';

export type RegionId =
  | 'britain'
  | 'france'
  | 'spain'
  | 'low_countries'
  | 'germany'
  | 'italy'
  | 'scandinavia'
  | 'poland'
  | 'austria'
  | 'balkans'
  | 'ottomans'
  | 'russia';

export type Region = {
  id: RegionId;
  name: string;
  x: number;
  y: number;
  owner: FactionId;
  income: {
    food: number;
    wood: number;
    iron: number;
    gold: number;
  };
  garrison: number;
  neighbors: RegionId[];
};

export type CampaignArmy = {
  id: string;
  name: string;
  faction: FactionId;
  regionId: RegionId;
  infantry: number;
  cavalry: number;
  artillery: number;
};

export type CampaignState = {
  turn: number;
  activeFaction: FactionId;
  selectedRegionId: RegionId | null;
  selectedArmyId: string | null;
  resources: Record<Exclude<FactionId, 'neutral'>, {
    food: number;
    wood: number;
    iron: number;
    gold: number;
  }>;
  regions: Region[];
  armies: CampaignArmy[];
};
