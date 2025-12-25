import React, { useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import { LocationPoint, SensoryLog } from '../types';

interface EmotionPathProps {
  locationPoints: LocationPoint[];
  sensoryLogs: SensoryLog[];
}

export default function EmotionPath({ locationPoints, sensoryLogs }: EmotionPathProps) {
  // Create path segments with emotion-based coloring
  const pathSegments = useMemo(() => {
    if (locationPoints.length < 2) return [];

    const segments: Array<{
      positions: [number, number][];
      color: string;
      emotion: string;
    }> = [];

    for (let i = 0; i < locationPoints.length - 1; i++) {
      const point1 = locationPoints[i];
      const point2 = locationPoints[i + 1];

      // Find logs near these points
      const log1 = sensoryLogs.find((log) => log.location_id === point1.id);
      const log2 = sensoryLogs.find((log) => log.location_id === point2.id);

      // Determine dominant emotion for this segment
      const getEmotionColor = (emotionCategory: string): string => {
        switch (emotionCategory) {
          case 'positive':
            return '#A8D5BA'; // Soft mint
          case 'negative':
            return '#E8B4B8'; // Soft rose
          case 'neutral':
            return '#D4C5E0'; // Soft lavender
          default:
            return '#B8D4E3'; // Soft sky
        }
      };

      const emotion1 = log1?.emotion_tags?.[0]?.category || 'neutral';
      const emotion2 = log2?.emotion_tags?.[0]?.category || 'neutral';

      // Use the emotion from the starting point, or blend if different
      const dominantEmotion = emotion1;
      const color = getEmotionColor(dominantEmotion);

      segments.push({
        positions: [
          [point1.latitude, point1.longitude],
          [point2.latitude, point2.longitude],
        ],
        color,
        emotion: dominantEmotion,
      });
    }

    return segments;
  }, [locationPoints, sensoryLogs]);

  if (pathSegments.length === 0) return null;

  return (
    <>
      {pathSegments.map((segment, index) => (
        <Polyline
          key={index}
          positions={segment.positions}
          pathOptions={{
            color: segment.color,
            weight: 5,
            opacity: 0.6,
            dashArray: '10, 10',
          }}
        />
      ))}
    </>
  );
}


