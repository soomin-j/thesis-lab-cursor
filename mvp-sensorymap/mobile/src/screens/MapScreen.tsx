import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import CustomMapView from '../components/CustomMapView';
import SensorySummaryOverlay from '../components/SensorySummaryOverlay';
import PredictionOverlay from '../components/PredictionOverlay';
import LocationService, { LocationPoint } from '../services/LocationService';
import { MockDataService } from '../services/MockDataService';
import { useAuth } from '../store/AuthContext';
import { SensoryLog } from '../types';

// Use mock data instead of API
const USE_MOCK_DATA = true;

export default function MapScreen() {
  const { user } = useAuth();
  const [locationPoints, setLocationPoints] = useState<LocationPoint[]>([]);
  const [sensoryLogs, setSensoryLogs] = useState<SensoryLog[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);

  useEffect(() => {
    if (user) {
      loadLocationHistory();
      loadSensoryLogs();
    }
  }, [user]);

  useEffect(() => {
    // Start tracking when component mounts
    LocationService.startTracking();
    setIsTracking(true);

    return () => {
      LocationService.stopTracking();
      setIsTracking(false);
    };
  }, []);

  const loadLocationHistory = async () => {
    if (!user) return;

    try {
      if (USE_MOCK_DATA) {
        const data = await MockDataService.getLocationHistory(user.id);
        setLocationPoints(data);
      } else {
        // const response = await api.get(`/locations/user/${user.id}`);
        // setLocationPoints(response.data);
      }
    } catch (error) {
      console.error('Error loading location history:', error);
    }
  };

  const loadSensoryLogs = async () => {
    if (!user) return;

    try {
      if (USE_MOCK_DATA) {
        const data = await MockDataService.getSensoryLogs(user.id);
        setSensoryLogs(data);
      } else {
        // const response = await api.get(`/logs/user/${user.id}`);
        // setSensoryLogs(response.data);
      }
    } catch (error) {
      console.error('Error loading sensory logs:', error);
    }
  };

  const handleLocationPress = (location: { latitude: number; longitude: number }) => {
    setSelectedLocation(location);
    setShowSummary(true);
  };

  const handleRequestPrediction = () => {
    setShowSummary(false);
    setShowPrediction(true);
  };

  return (
    <View style={styles.container}>
      <CustomMapView
        locationPoints={locationPoints}
        sensoryLogs={sensoryLogs}
        onLocationPress={handleLocationPress}
        showUserLocation={true}
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isTracking && styles.buttonActive]}
          onPress={() => {
            if (isTracking) {
              LocationService.stopTracking();
              setIsTracking(false);
            } else {
              LocationService.startTracking();
              setIsTracking(true);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>

      <SensorySummaryOverlay
        visible={showSummary}
        location={selectedLocation}
        onClose={() => {
          setShowSummary(false);
          setSelectedLocation(null);
        }}
        onRequestPrediction={handleRequestPrediction}
      />

      <PredictionOverlay
        visible={showPrediction}
        location={selectedLocation}
        onClose={() => {
          setShowPrediction(false);
          setSelectedLocation(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

