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

export interface Profile {
  id: string;                // corresponde ao auth.users.id
  name: string;              // nome do usuário
  email: string;             // email do usuário
  created_at: string;        // data de criação do usuário
  is_admin: boolean;         // se é admin/testador
  territories_owned: number; // quantidade de áreas dominadas
  total_area: number;        // área total dominada em m²
  total_conquests: number;   // total de conquistas
  avatar_url?: string | null; // URL do avatar, opcional
  bio?: string | null;        // bio do usuário, opcional
}
