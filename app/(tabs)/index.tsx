import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Polygon, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Play, Square, MapPin, Navigation } from 'lucide-react-native';
import { useTerritory } from '@/contexts/territory';
import { useAuth } from '@/contexts/auth';

export default function MapScreen() {
  const { user } = useAuth();
  const {
    territories,
    isTracking,
    currentRoute,
    startTracking,
    addRoutePoint,
    finishTracking,
  } = useTerritory();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      } else {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos da sua localização para registrar territórios'
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Erro', 'Não foi possível acessar sua localização');
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = useCallback(async () => {
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
          addRoutePoint({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }, [addRoutePoint]);

  const stopLocationTracking = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isTracking && hasPermission) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isTracking, hasPermission, startLocationTracking, stopLocationTracking]);

  const handleStartTracking = () => {
    if (!hasPermission) {
      requestLocationPermission();
      return;
    }
    startTracking();
  };

  const handleFinishTracking = async () => {
    if (currentRoute.length < 3) {
      Alert.alert(
        'Território Pequeno',
        'Você precisa percorrer uma área maior para criar um território'
      );
      return;
    }

    const territory = await finishTracking();
    if (territory) {
      Alert.alert(
        'Território Conquistado! 🎉',
        `Você dominou uma área de ${Math.round(territory.area)} m²`
      );
    }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.errorContainer}>
        <MapPin size={64} color="#666" />
        <Text style={styles.errorTitle}>Permissão Necessária</Text>
        <Text style={styles.errorText}>
          Precisamos acessar sua localização para mostrar o mapa e registrar territórios
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestLocationPermission}>
          <Text style={styles.permissionButtonText}>Permitir Localização</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {territories.map((territory) => (
          <Polygon
            key={territory.id}
            coordinates={territory.coordinates}
            fillColor={`${territory.color}40`}
            strokeColor={territory.color}
            strokeWidth={2}
          />
        ))}

        {isTracking && currentRoute.length > 0 && (
          <Polyline
            coordinates={currentRoute}
            strokeColor="#FF6B6B"
            strokeWidth={4}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
        <Navigation size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.controls}>
        {isTracking ? (
          <View style={styles.trackingInfo}>
            <View style={styles.trackingHeader}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Gravando</Text>
              </View>
              <Text style={styles.pointsCount}>{currentRoute.length} pontos</Text>
            </View>

            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleFinishTracking}
            >
              <Square size={24} color="#fff" fill="#fff" />
              <Text style={styles.controlButtonText}>Finalizar e Conquistar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStartTracking}
          >
            <Play size={24} color="#fff" fill="#fff" />
            <Text style={styles.controlButtonText}>Iniciar Captura</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{territories.length}</Text>
          <Text style={styles.statLabel}>Territórios</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {territories.filter(t => t.ownerId === user?.id).length}
          </Text>
          <Text style={styles.statLabel}>Seus</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  errorText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controls: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  trackingInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  pointsCount: {
    fontSize: 14,
    color: '#888',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButton: {
    backgroundColor: '#FF6B6B',
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  stats: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2a2a2a',
  },
});
