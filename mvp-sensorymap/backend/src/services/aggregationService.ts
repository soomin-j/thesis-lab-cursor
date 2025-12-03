import pool from '../config/database';
import { SensoryLogModel } from '../models/SensoryLog';

export interface AggregatedTag {
  tag: {
    id: string;
    emoji: string;
    label: string;
    category: string;
  };
  percentage: number;
  count: number;
}

export interface SensorySummary {
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  totalReviews: number;
  topEmotions: AggregatedTag[];
  topSensoryTags: AggregatedTag[];
  lastUpdated: Date;
}

export async function getSensorySummary(
  latitude: number,
  longitude: number,
  radius: number = 0.001
): Promise<SensorySummary> {
  // Get all sensory logs within radius
  const logs = await SensoryLogModel.findByLocationRadius(latitude, longitude, radius);

  // Aggregate emotion tags
  const emotionCounts: Record<string, { tag: any; count: number }> = {};
  logs.forEach((log) => {
    const emotionTags = log.emotion_tags || [];
    emotionTags.forEach((tag: any) => {
      const key = tag.id;
      if (!emotionCounts[key]) {
        emotionCounts[key] = { tag, count: 0 };
      }
      emotionCounts[key].count++;
    });
  });

  // Aggregate sensory tags
  const sensoryCounts: Record<string, { tag: any; count: number }> = {};
  logs.forEach((log) => {
    const sensoryTags = log.sensory_tags || [];
    sensoryTags.forEach((tag: any) => {
      const key = `${tag.category}-${tag.id}`;
      if (!sensoryCounts[key]) {
        sensoryCounts[key] = { tag, count: 0 };
      }
      sensoryCounts[key].count++;
    });
  });

  const totalReviews = logs.length;

  // Calculate percentages and sort
  const topEmotions: AggregatedTag[] = Object.values(emotionCounts)
    .map((item) => ({
      tag: item.tag,
      percentage: totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0,
      count: item.count,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  const topSensoryTags: AggregatedTag[] = Object.values(sensoryCounts)
    .map((item) => ({
      tag: item.tag,
      percentage: totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0,
      count: item.count,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

  return {
    location: { lat: latitude, lng: longitude },
    radius,
    totalReviews,
    topEmotions,
    topSensoryTags,
    lastUpdated: new Date(),
  };
}

export async function cacheSensorySummary(
  latitude: number,
  longitude: number,
  radius: number,
  summary: SensorySummary
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO aggregated_sensory_data (latitude, longitude, radius, aggregated_tags, total_reviews, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (latitude, longitude, radius) 
       DO UPDATE SET aggregated_tags = $4, total_reviews = $5, last_updated = $6`,
      [
        latitude,
        longitude,
        radius,
        JSON.stringify(summary),
        summary.totalReviews,
        summary.lastUpdated,
      ]
    );
  } catch (error) {
    console.error('Error caching sensory summary:', error);
  }
}

