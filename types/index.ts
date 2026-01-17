export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Territory {
  id: string;
  ownerId: string;
  ownerName: string;
  coordinates: Coordinate[];
  area: number;
  conqueredAt: string;
  color: string;
}

export interface Activity {
  id: string;
  userId: string;
  coordinates: Coordinate[];
  startedAt: string;
  finishedAt: string;
  distance: number;
  territoryCreated?: Territory;
}

export interface WeeklyStats {
  userId: string;
  territoriesOwned: number;
  totalArea: number;
  weekStart: string;
}

export interface UserStats {
  territoriesOwned: number;
  totalArea: number;
  weeklyScore: number;
  totalConquests: number;
}
