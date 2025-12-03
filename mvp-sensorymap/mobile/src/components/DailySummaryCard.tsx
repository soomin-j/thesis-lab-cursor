import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SensoryLog, LocationPoint, EmotionTag, SensoryTag } from '../types';

interface DailySummary {
  date: Date;
  totalDistance: number; // in meters
  totalLogs: number;
  mostCommonEmotions: Array<{ tag: EmotionTag; count: number }>;
  sensoryPatterns: Array<{ category: string; tags: Array<{ tag: SensoryTag; count: number }> }>;
  timeInZones: {
    positive: number; // minutes
    negative: number;
    neutral: number;
  };
}

interface DailySummaryCardProps {
  summary: DailySummary;
}

export default function DailySummaryCard({ summary }: DailySummaryCardProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>
        {summary.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{summary.totalLogs}</Text>
          <Text style={styles.statLabel}>Logs</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(summary.totalDistance)}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
      </View>

      {/* Most Common Emotions */}
      {summary.mostCommonEmotions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Emotions</Text>
          <View style={styles.tagRow}>
            {summary.mostCommonEmotions.slice(0, 3).map((item) => (
              <View key={item.tag.id} style={styles.emotionTag}>
                <Text style={styles.emotionEmoji}>{item.tag.emoji}</Text>
                <Text style={styles.emotionLabel}>{item.tag.label}</Text>
                <Text style={styles.emotionCount}>{item.count}x</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Time in Zones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time in Zones</Text>
        <View style={styles.zoneRow}>
          <View style={[styles.zone, styles.zonePositive]}>
            <Text style={styles.zoneLabel}>Positive</Text>
            <Text style={styles.zoneValue}>{formatTime(summary.timeInZones.positive)}</Text>
          </View>
          <View style={[styles.zone, styles.zoneNeutral]}>
            <Text style={styles.zoneLabel}>Neutral</Text>
            <Text style={styles.zoneValue}>{formatTime(summary.timeInZones.neutral)}</Text>
          </View>
          <View style={[styles.zone, styles.zoneNegative]}>
            <Text style={styles.zoneLabel}>Negative</Text>
            <Text style={styles.zoneValue}>{formatTime(summary.timeInZones.negative)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  emotionEmoji: {
    fontSize: 20,
    marginRight: 4,
  },
  emotionLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  emotionCount: {
    fontSize: 12,
    color: '#666',
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zone: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  zonePositive: {
    backgroundColor: '#E8F5E9',
  },
  zoneNeutral: {
    backgroundColor: '#F5F5F5',
  },
  zoneNegative: {
    backgroundColor: '#FFEBEE',
  },
  zoneLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  zoneValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

