import { useAuth } from "@/contexts/auth";
import { useTerritory } from "@/contexts/territory";
import * as Location from "expo-location";
import { MapPin, Navigation, Play, Square } from "lucide-react-native";
import { styles } from "./index.styles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polygon, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

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

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [joystickMode, setJoystickMode] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      } else {
        Alert.alert(
          "Permissão Necessária",
          "Precisamos da sua localização para registrar territórios"
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("Erro", "Não foi possível acessar sua localização");
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
      console.error("Error starting location tracking:", error);
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
    if (isTracking && hasPermission && !joystickMode) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isTracking, hasPermission, joystickMode, startLocationTracking, stopLocationTracking]);
  

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
        "Território Pequeno",
        "Você precisa percorrer uma área maior para criar um território"
      );
      return;
    }

    const territory = await finishTracking();
    if (territory) {
      Alert.alert(
        "Território Conquistado! 🎉",
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
          Precisamos acessar sua localização para mostrar o mapa e registrar
          territórios
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestLocationPermission}
        >
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

  const moveByJoystick = (dx: number, dy: number) => {
    if (!location) return;

    const SPEED = 0.00001; // ajuste fino

    const newLocation = {
      ...location,
      coords: {
        ...location.coords,
        latitude: location.coords.latitude + dy * SPEED,
        longitude: location.coords.longitude + dx * SPEED,
      },
    };

    setLocation(newLocation);

    if (isTracking) {
      addRoutePoint({
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
      });
    }

    mapRef.current?.animateCamera({
      center: {
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
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
              <Text style={styles.pointsCount}>
                {currentRoute.length} pontos
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleFinishTracking}
            >
              <Square size={24} color="#fff" fill="#fff" />
              <Text style={styles.controlButtonText}>
                Finalizar e Conquistar
              </Text>
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
      <View style={styles.joystickContainer}>
        <TouchableOpacity
          style={styles.joystickButton}
          onPress={() => moveByJoystick(0, 1)}
        >
          <Text>↑</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.joystickButton}
            onPress={() => moveByJoystick(-1, 0)}
          >
            <Text>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.joystickButton}
            onPress={() => moveByJoystick(1, 0)}
          >
            <Text>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.joystickButton}
          onPress={() => moveByJoystick(0, -1)}
        >
          <Text>↓</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{territories.length}</Text>
          <Text style={styles.statLabel}>Territórios</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {territories.filter((t) => t.ownerId === user?.id).length}
          </Text>
          <Text style={styles.statLabel}>Seus</Text>
        </View>
      </View>
    </View>
  );
}
