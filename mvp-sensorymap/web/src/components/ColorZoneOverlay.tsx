import React from 'react';
import { Circle } from 'react-leaflet';
import { SensoryLog, LocationPoint } from '../types';

interface ColorZoneOverlayProps {
  sensoryLogs: SensoryLog[];
  locationPoints: LocationPoint[];
}

export default function ColorZoneOverlay({ sensoryLogs, locationPoints }: ColorZoneOverlayProps) {
  // Group logs by location and determine dominant emotion
  const locationEmotions = sensoryLogs.reduce((acc, log) => {
    if (!log.location_id || !log.emotion_tags?.[0]) return acc;
    
    const location = locationPoints.find((lp) => lp.id === log.location_id);
    if (!location) return acc;

    const key = `${location.latitude},${location.longitude}`;
    if (!acc[key]) {
      acc[key] = {
        location,
        emotions: [],
      };
    }
    acc[key].emotions.push(log.emotion_tags[0]);
    return acc;
  }, {} as Record<string, { location: LocationPoint; emotions: any[] }>);

  // Determine dominant emotion category for each location
  const zones = Object.values(locationEmotions).map(({ location, emotions }) => {
    const categoryCounts = emotions.reduce((acc, emotion) => {
      acc[emotion.category] = (acc[emotion.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantCategory = ((Object.entries(categoryCounts) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0]) || 'neutral';

    // Calculate intensity based on number of logs and consistency
    const logCount = emotions.length;
    const consistency = emotions.filter(e => e.id === emotions[0].id).length / emotions.length;
    const intensity = Math.min((logCount / 5) * 0.7 + consistency * 0.3, 1);

    return {
      position: [location.latitude, location.longitude] as [number, number],
      category: dominantCategory,
      radius: 120 + (intensity * 50), // 120-170 meters based on intensity
      intensity: intensity,
    };
  });

  return (
    <>
      {zones.map((zone, index) => {
        const getColor = () => {
          switch (zone.category) {
            case 'positive':
              return 'rgba(168, 213, 186, 0.8)';
            case 'negative':
              return 'rgba(232, 180, 184, 0.8)';
            case 'neutral':
              return 'rgba(212, 197, 224, 0.8)';
            case 'calm':
              return 'rgba(173, 216, 230, 0.8)'; // Light Blue
            case 'excited':
              return 'rgba(255, 165, 0, 0.8)'; // Orange
            case 'anxious':
              return 'rgba(221, 160, 221, 0.8)'; // Plum
            default:
              return 'rgba(184, 212, 227, 0.8)';
          }
        };

        const getBorderColor = () => {
          switch (zone.category) {
            case 'positive':
              return 'rgba(127, 184, 161, 0.9)';
            case 'negative':
              return 'rgba(216, 155, 160, 0.9)';
            case 'neutral':
              return 'rgba(196, 176, 212, 0.9)';
            case 'calm':
              return 'rgba(135, 206, 235, 0.9)';
            case 'excited':
              return 'rgba(255, 140, 0, 0.9)';
            case 'anxious':
              return 'rgba(221, 160, 221, 0.9)';
            default:
              return 'rgba(159, 196, 211, 0.9)';
          }
        };

        // Enhanced opacity and size based on intensity
        const fillOpacity = 0.7 + (zone.intensity * 0.2); // 0.7-0.9
        const borderOpacity = 0.9; // Solid border
        const borderWeight = 1; // 1px fixed border width

        // Add pulsing animation for high-intensity zones
        const isHighIntensity = zone.intensity > 0.7;
        const className = isHighIntensity ? 'high-intensity-zone' : '';

        return (
          <Circle
            key={index}
            center={zone.position}
            radius={zone.radius}
            pathOptions={{
              fillColor: getColor(),
              fillOpacity: fillOpacity,
              color: getBorderColor(),
              weight: borderWeight,
              opacity: borderOpacity,
            }}
            className={className}
          />
        );
      })}
    </>
  );
}

