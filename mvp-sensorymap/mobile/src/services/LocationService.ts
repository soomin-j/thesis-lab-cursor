import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockDataService } from './MockDataService';

// Use mock data instead of API
const USE_MOCK_DATA = true;

export interface LocationPoint {
  id?: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

class LocationService {
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private updateInterval: number = 5 * 60 * 1000; // 5 minutes default
  private lastLocationTime: number = 0;
  private minUpdateInterval: number = 2 * 60 * 1000; // Minimum 2 minutes between updates

  async startTracking(interval?: number) {
    if (this.isTracking) {
      return;
    }

    this.updateInterval = interval || this.updateInterval;
    this.isTracking = true;

    // Request permissions
    Geolocation.requestAuthorization();

    // Get initial location
    this.getCurrentLocation();

    // Set up periodic updates
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - this.lastLocationTime >= this.minUpdateInterval) {
          this.saveLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
            accuracy: position.coords.accuracy || undefined,
          });
          this.lastLocationTime = now;
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: false, // Battery optimization
        timeout: 10000,
        maximumAge: 60000,
        distanceFilter: 50, // Only update if moved 50 meters
      }
    );
  }

  stopTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  async getCurrentLocation(): Promise<LocationPoint> {
    if (USE_MOCK_DATA) {
      // Return a mock location (San Francisco)
      const mockLocation: LocationPoint = {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: new Date(),
        accuracy: 10,
      };
      this.saveLocation(mockLocation);
      return mockLocation;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: LocationPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
            accuracy: position.coords.accuracy || undefined,
          };
          this.saveLocation(location);
          resolve(location);
        },
        (error) => {
          // If geolocation fails, return mock location for demo
          if (USE_MOCK_DATA) {
            const mockLocation: LocationPoint = {
              latitude: 37.7749,
              longitude: -122.4194,
              timestamp: new Date(),
              accuracy: 10,
            };
            this.saveLocation(mockLocation);
            resolve(mockLocation);
          } else {
            reject(error);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  private async saveLocation(location: LocationPoint) {
    try {
      // Save to local storage first (for offline support)
      const locations = await this.getLocalLocations();
      locations.push(location);
      await AsyncStorage.setItem('localLocations', JSON.stringify(locations));

      // Try to sync with backend
      await this.syncLocationToBackend(location);
    } catch (error) {
      console.error('Error saving location:', error);
    }
  }

  private async syncLocationToBackend(location: LocationPoint) {
    try {
      if (USE_MOCK_DATA) {
        // In mock mode, locations are stored locally only
        // They're already saved to AsyncStorage in saveLocation
        console.log('Location saved (mock mode):', location);
      } else {
        // await api.post('/locations', {
        //   latitude: location.latitude,
        //   longitude: location.longitude,
        //   accuracy: location.accuracy,
        //   timestamp: location.timestamp.toISOString(),
        // });
      }
    } catch (error) {
      console.error('Error syncing location to backend:', error);
      // Location will be synced later
    }
  }

  async getLocalLocations(): Promise<LocationPoint[]> {
    try {
      const data = await AsyncStorage.getItem('localLocations');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async syncLocalLocations() {
    const localLocations = await this.getLocalLocations();
    for (const location of localLocations) {
      try {
        await this.syncLocationToBackend(location);
      } catch (error) {
        console.error('Error syncing location:', error);
      }
    }
    // Clear synced locations (only in API mode)
    if (!USE_MOCK_DATA) {
      await AsyncStorage.removeItem('localLocations');
    }
  }

  isTrackingActive(): boolean {
    return this.isTracking;
  }
}

export default new LocationService();

