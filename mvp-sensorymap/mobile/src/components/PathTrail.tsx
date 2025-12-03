import React from 'react';
import { Polyline } from 'react-native-maps';
import { LocationPoint, SensoryLog } from '../types';

interface PathTrailProps {
  locationPoints: LocationPoint[];
  sensoryLogs: SensoryLog[];
}

export default function PathTrail({ locationPoints, sensoryLogs }: PathTrailProps) {
  if (locationPoints.length < 2) {
    return null;
  }

  // Create path segments with color coding based on emotions
  const pathSegments: Array<{
    coordinates: Array<{ latitude: number; longitude: number }>;
    color: string;
  }> = [];

  for (let i = 0; i < locationPoints.length - 1; i++) {
    const startPoint = locationPoints[i];
    const endPoint = locationPoints[i + 1];

    // Find sensory log for this segment
    const log = sensoryLogs.find(
      (l) => l.location_id === startPoint.id || l.location_id === endPoint.id
    );

    // Determine color based on dominant emotion
    let color = '#007AFF'; // Default blue
    if (log && log.emotion_tags.length > 0) {
      const dominantEmotion = log.emotion_tags[0];
      switch (dominantEmotion.category) {
        case 'positive':
          color = '#34C759'; // Green
          break;
        case 'negative':
          color = '#FF3B30'; // Red
          break;
        case 'neutral':
          color = '#8E8E93'; // Gray
          break;
      }
    }

    pathSegments.push({
      coordinates: [
        { latitude: startPoint.latitude, longitude: startPoint.longitude },
        { latitude: endPoint.latitude, longitude: endPoint.longitude },
      ],
      color,
    });
  }

  return (
    <>
      {pathSegments.map((segment, index) => (
        <Polyline
          key={index}
          coordinates={segment.coordinates}
          strokeColor={segment.color}
          strokeWidth={4}
          lineDashPattern={[1]}
        />
      ))}
    </>
  );
}

