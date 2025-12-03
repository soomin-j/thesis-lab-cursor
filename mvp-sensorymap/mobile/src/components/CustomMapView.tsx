import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, Marker, Polyline } from 'react-native-maps';
import LocationService, { LocationPoint } from '../services/LocationService';
import { SensoryLog } from '../types';
import EmotionPin from './EmotionPin';
import PathTrail from './PathTrail';

interface CustomMapViewProps {
  onLocationPress?: (location: { latitude: number; longitude: number }) => void;
  locationPoints?: LocationPoint[];
  sensoryLogs?: SensoryLog[];
  showUserLocation?: boolean;
  initialRegion?: Region;
}

const { width, height } = Dimensions.get('window');

export default function CustomMapView({
  onLocationPress,
  locationPoints = [],
  sensoryLogs = [],
  showUserLocation = true,
  initialRegion,
}: CustomMapViewProps) {
  const [region, setRegion] = useState<Region>(
    initialRegion || {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);

  useEffect(() => {
    if (showUserLocation) {
      LocationService.getCurrentLocation().then(setCurrentLocation);
    }
  }, [showUserLocation]);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (onLocationPress) {
      onLocationPress({ latitude, longitude });
    }
  };

  // Create path from location points
  const pathCoordinates = locationPoints.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  // Custom map style - muted colors for reduced visual noise
  const customMapStyle = [
    {
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      featureType: 'administrative.land_parcel',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative.neighborhood',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#dadada' }],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [{ color: '#eeeeee' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9c9c9' }],
    },
  ];

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={customMapStyle}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {/* User path with emotion-based coloring */}
        <PathTrail locationPoints={locationPoints} sensoryLogs={sensoryLogs} />

        {/* Location point markers */}
        {locationPoints.map((point, index) => (
          <Marker
            key={point.id || index}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={`Location ${index + 1}`}
            description={new Date(point.timestamp).toLocaleTimeString()}
          />
        ))}

        {/* Sensory log markers with emotion pins */}
        {sensoryLogs.map((log, index) => {
          if (!log.location_id) return null;
          const locationPoint = locationPoints.find((lp) => lp.id === log.location_id);
          if (!locationPoint) return null;

          const dominantEmotion = log.emotion_tags[0];
          if (!dominantEmotion) return null;

          return (
            <Marker
              key={log.id || `log-${index}`}
              coordinate={{
                latitude: locationPoint.latitude,
                longitude: locationPoint.longitude,
              }}
              title={log.description || 'Sensory log'}
            >
              <EmotionPin emotion={dominantEmotion} size={50} />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
});

