import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import CustomMapView from '../components/CustomMapView';
import DailySummaryCard from '../components/DailySummaryCard';
import { MockDataService } from '../services/MockDataService';
import { useAuth } from '../store/AuthContext';
import { SensoryLog, LocationPoint } from '../types';

// Use mock data instead of API
const USE_MOCK_DATA = true;

interface DailySummary {
  date: Date;
  totalDistance: number;
  totalLogs: number;
  mostCommonEmotions: Array<{ tag: any; count: number }>;
  sensoryPatterns: Array<{ category: string; tags: Array<{ tag: any; count: number }> }>;
  timeInZones: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyLogs, setDailyLogs] = useState<SensoryLog[]>([]);
  const [dailyLocations, setDailyLocations] = useState<LocationPoint[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDailyData();
    }
  }, [user, selectedDate]);

  const loadDailyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      if (USE_MOCK_DATA) {
        const logs = await MockDataService.getDailyLogs(user.id, dateStr);
        const locations = await MockDataService.getLocationHistory(user.id);

        setDailyLogs(logs);
        setDailyLocations(locations);

        // Calculate summary
        const calculatedSummary = calculateSummary(logs, locations, selectedDate);
        setSummary(calculatedSummary);
      } else {
        // Original API code (commented out for mock mode)
        // const [logsResponse, locationsResponse] = await Promise.all([
        //   api.get(`/logs/user/${user.id}/daily/${dateStr}`),
        //   api.get(`/locations/user/${user.id}?startDate=${dateStr}&endDate=${dateStr}`),
        // ]);
        // const logs = logsResponse.data;
        // const locations = locationsResponse.data;
        // setDailyLogs(logs);
        // setDailyLocations(locations);
        // const calculatedSummary = calculateSummary(logs, locations, selectedDate);
        // setSummary(calculatedSummary);
      }
    } catch (error) {
      console.error('Error loading daily data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (
    logs: SensoryLog[],
    locations: LocationPoint[],
    date: Date
  ): DailySummary => {
    // Calculate distance
    let totalDistance = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      const distance = calculateDistance(
        locations[i].latitude,
        locations[i].longitude,
        locations[i + 1].latitude,
        locations[i + 1].longitude
      );
      totalDistance += distance;
    }

    // Count emotions
    const emotionCounts: Record<string, number> = {};
    logs.forEach((log) => {
      log.emotion_tags?.forEach((tag) => {
        emotionCounts[tag.id] = (emotionCounts[tag.id] || 0) + 1;
      });
    });

    const mostCommonEmotions = Object.entries(emotionCounts)
      .map(([id, count]) => {
        const tag = logs
          .flatMap((l) => l.emotion_tags || [])
          .find((t) => t.id === id);
        return tag ? { tag, count } : null;
      })
      .filter((item): item is { tag: any; count: number } => item !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate time in zones (simplified - based on log timestamps)
    const timeInZones = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    logs.forEach((log) => {
      const dominantEmotion = log.emotion_tags?.[0];
      if (dominantEmotion) {
        const category = dominantEmotion.category;
        if (category === 'positive') timeInZones.positive += 15; // Assume 15 min per log
        else if (category === 'negative') timeInZones.negative += 15;
        else timeInZones.neutral += 15;
      }
    });

    return {
      date,
      totalDistance,
      totalLogs: logs.length,
      mostCommonEmotions,
      sensoryPatterns: [], // Can be enhanced
      timeInZones,
    };
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <Text style={styles.navButton}>← Previous</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity onPress={() => changeDate(1)}>
          <Text style={styles.navButton}>Next →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {summary && <DailySummaryCard summary={summary} />}

        {/* Historical Map */}
        {dailyLocations.length > 0 && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Your Path</Text>
            <CustomMapView
              locationPoints={dailyLocations}
              sensoryLogs={dailyLogs}
              showUserLocation={false}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapContainer: {
    height: 400,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    backgroundColor: '#fff',
  },
});

