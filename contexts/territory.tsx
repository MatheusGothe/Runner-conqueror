import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Territory, Activity, Coordinate } from '@/types';
import { useAuth } from './auth';

const TERRITORIES_KEY = '@territory_territories';
const ACTIVITIES_KEY = '@territory_activities';

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

function calculatePolygonArea(coordinates: Coordinate[]): number {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    area += coordinates[i].latitude * coordinates[j].longitude;
    area -= coordinates[j].latitude * coordinates[i].longitude;
  }
  return Math.abs(area / 2) * 111000 * 111000;
}

function doPolygonsIntersect(poly1: Coordinate[], poly2: Coordinate[]): boolean {
  for (const point of poly2) {
    if (isPointInPolygon(point, poly1)) {
      return true;
    }
  }
  for (const point of poly1) {
    if (isPointInPolygon(point, poly2)) {
      return true;
    }
  }
  return false;
}

function isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;
    
    const intersect = ((yi > point.longitude) !== (yj > point.longitude))
      && (point.latitude < (xj - xi) * (point.longitude - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export const [TerritoryContext, useTerritory] = createContextHook(() => {
  const { user } = useAuth();
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Coordinate[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [territoriesData, activitiesData] = await Promise.all([
        AsyncStorage.getItem(TERRITORIES_KEY),
        AsyncStorage.getItem(ACTIVITIES_KEY),
      ]);

      if (territoriesData) setTerritories(JSON.parse(territoriesData));
      if (activitiesData) setActivities(JSON.parse(activitiesData));
    } catch (error) {
      console.error('Error loading territory data:', error);
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    setCurrentRoute([]);
  };

  const addRoutePoint = (coordinate: Coordinate) => {
    setCurrentRoute(prev => [...prev, coordinate]);
  };

  const finishTracking = async (): Promise<Territory | null> => {
    if (!user || currentRoute.length < 3) {
      setIsTracking(false);
      setCurrentRoute([]);
      return null;
    }

    const newTerritory: Territory = {
      id: Date.now().toString(),
      ownerId: user.id,
      ownerName: user.name,
      coordinates: [...currentRoute],
      area: calculatePolygonArea(currentRoute),
      conqueredAt: new Date().toISOString(),
      color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
    };

    const updatedTerritories = territories.filter(t => {
      if (doPolygonsIntersect(t.coordinates, newTerritory.coordinates)) {
        return false;
      }
      return true;
    });

    updatedTerritories.push(newTerritory);

    const newActivity: Activity = {
      id: Date.now().toString(),
      userId: user.id,
      coordinates: [...currentRoute],
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      distance: 0,
      territoryCreated: newTerritory,
    };

    const updatedActivities = [...activities, newActivity];

    try {
      await AsyncStorage.setItem(TERRITORIES_KEY, JSON.stringify(updatedTerritories));
      await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updatedActivities));
      
      setTerritories(updatedTerritories);
      setActivities(updatedActivities);
      setIsTracking(false);
      setCurrentRoute([]);
      
      return newTerritory;
    } catch (error) {
      console.error('Error saving territory:', error);
      setIsTracking(false);
      setCurrentRoute([]);
      return null;
    }
  };

  const getUserTerritories = (userId: string) => {
    return territories.filter(t => t.ownerId === userId);
  };

  const getUserStats = (userId: string) => {
    const userTerritories = getUserTerritories(userId);
    return {
      territoriesOwned: userTerritories.length,
      totalArea: userTerritories.reduce((sum, t) => sum + t.area, 0),
      weeklyScore: userTerritories.length,
      totalConquests: activities.filter(a => a.userId === userId && a.territoryCreated).length,
    };
  };

  return {
    territories,
    activities,
    isTracking,
    currentRoute,
    startTracking,
    addRoutePoint,
    finishTracking,
    getUserTerritories,
    getUserStats,
  };
});
