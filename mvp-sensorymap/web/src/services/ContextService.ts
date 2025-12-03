import { SensoryLog, LocationPoint } from '../types';

interface TimePattern {
  timeOfDay: string;
  dominantEmotion: string;
  percentage: number;
}

interface ContextualInsights {
  timePatterns: TimePattern[];
  weatherNote?: string;
  crowdPattern?: string;
  accessibilityNote?: string;
  trend?: string;
}

export class ContextService {
  static analyzeLocationPatterns(
    logs: SensoryLog[],
    locationPoints: LocationPoint[],
    targetLat: number,
    targetLng: number,
    radius: number = 0.001
  ): ContextualInsights {
    // Find logs within radius
    const nearbyLogs = logs.filter((log) => {
      const location = locationPoints.find((lp) => lp.id === log.location_id);
      if (!location) return false;

      const distance = this.calculateDistance(
        targetLat,
        targetLng,
        location.latitude,
        location.longitude
      );
      return distance <= radius;
    });

    if (nearbyLogs.length === 0) {
      return { timePatterns: [] };
    }

    // Analyze time patterns
    const timePatterns = this.analyzeTimePatterns(nearbyLogs);

    // Analyze crowd patterns (based on "crowded" sensory tag)
    const crowdPattern = this.analyzeCrowdPattern(nearbyLogs);

    // Analyze trends (comparing recent vs older logs)
    const trend = this.analyzeTrend(nearbyLogs);

    return {
      timePatterns,
      crowdPattern,
      trend,
    };
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static analyzeTimePatterns(logs: SensoryLog[]): TimePattern[] {
    const timeGroups: Record<string, SensoryLog[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };

    logs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours();
      if (hour >= 6 && hour < 12) timeGroups.morning.push(log);
      else if (hour >= 12 && hour < 18) timeGroups.afternoon.push(log);
      else if (hour >= 18 && hour < 22) timeGroups.evening.push(log);
      else timeGroups.night.push(log);
    });

    return Object.entries(timeGroups)
      .map(([timeOfDay, timeLogs]) => {
        if (timeLogs.length === 0) return null;

        const emotionCounts: Record<string, number> = {};
        timeLogs.forEach((log) => {
          log.emotion_tags.forEach((emotion) => {
            emotionCounts[emotion.id] = (emotionCounts[emotion.id] || 0) + 1;
          });
        });

        const dominantEmotion = Object.entries(emotionCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

        return {
          timeOfDay,
          dominantEmotion,
          percentage: Math.round((timeLogs.length / logs.length) * 100),
        };
      })
      .filter((p): p is TimePattern => p !== null);
  }

  private static analyzeCrowdPattern(logs: SensoryLog[]): string | undefined {
    const crowdedLogs = logs.filter((log) =>
      log.sensory_tags.some((tag) => tag.id === 'crowded')
    );
    const crowdedPercentage = (crowdedLogs.length / logs.length) * 100;

    if (crowdedPercentage > 60) {
      return 'Usually crowded';
    } else if (crowdedPercentage > 40) {
      return 'Moderately busy';
    } else if (crowdedPercentage > 20) {
      return 'Sometimes busy';
    } else {
      return 'Generally quiet';
    }
  }

  private static analyzeTrend(logs: SensoryLog[]): string | undefined {
    if (logs.length < 4) return undefined;

    // Split logs into recent (last 50%) and older (first 50%)
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const midpoint = Math.floor(sortedLogs.length / 2);
    const recentLogs = sortedLogs.slice(0, midpoint);
    const olderLogs = sortedLogs.slice(midpoint);

    const recentPositive = recentLogs.filter((log) =>
      log.emotion_tags.some((e) => e.category === 'positive')
    ).length;
    const olderPositive = olderLogs.filter((log) =>
      log.emotion_tags.some((e) => e.category === 'positive')
    ).length;

    const recentPositiveRatio = recentPositive / recentLogs.length;
    const olderPositiveRatio = olderPositive / olderLogs.length;

    if (recentPositiveRatio > olderPositiveRatio + 0.2) {
      return 'Becoming more positive';
    } else if (recentPositiveRatio < olderPositiveRatio - 0.2) {
      return 'Becoming less positive';
    }

    return undefined;
  }
}

