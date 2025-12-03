import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { SensoryLog, LocationPoint } from '../types';

export type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening' | 'night' | 'current';

interface AmbientGradientOverlayProps {
  sensoryLogs: SensoryLog[];
  locationPoints: LocationPoint[];
  visible: boolean;
  timeFilter?: TimeFilter;
}

const getTimeRange = (filter: TimeFilter): { start: number; end: number } | null => {
  const now = new Date();
  const currentHour = now.getHours();

  switch (filter) {
    case 'morning':
      return { start: 6, end: 12 };
    case 'afternoon':
      return { start: 12, end: 18 };
    case 'evening':
      return { start: 18, end: 22 };
    case 'night':
      return { start: 22, end: 6 };
    case 'current':
      return { start: currentHour, end: currentHour + 1 };
    default:
      return null;
  }
};

const filterLogsByTime = (logs: SensoryLog[], timeFilter: TimeFilter): SensoryLog[] => {
  if (timeFilter === 'all') return logs;

  const timeRange = getTimeRange(timeFilter);
  if (!timeRange) return logs;

  return logs.filter((log) => {
    const logHour = new Date(log.timestamp).getHours();
    if (timeRange.start <= timeRange.end) {
      return logHour >= timeRange.start && logHour < timeRange.end;
    } else {
      // Night case: spans midnight
      return logHour >= timeRange.start || logHour < timeRange.end;
    }
  });
};

export default function AmbientGradientOverlay({
  sensoryLogs,
  locationPoints,
  visible,
  timeFilter = 'all',
}: AmbientGradientOverlayProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const filteredLogs = filterLogsByTime(sensoryLogs, timeFilter);
    if (!visible || filteredLogs.length === 0) return;

    // Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';
    canvas.style.opacity = '0.7';
    canvas.style.mixBlendMode = 'multiply';
    
    const container = map.getContainer();
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Group logs by location and calculate emotion intensity
    const locationData = filteredLogs.reduce((acc, log) => {
      if (!log.location_id || !log.emotion_tags?.[0]) return acc;
      
      const location = locationPoints.find((lp) => lp.id === log.location_id);
      if (!location) return acc;

      const key = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
      if (!acc[key]) {
        acc[key] = {
          location,
          emotions: [],
          intensity: 0,
        };
      }
      acc[key].emotions.push(log.emotion_tags[0]);
      acc[key].intensity += 1;
      return acc;
    }, {} as Record<string, { location: LocationPoint; emotions: any[]; intensity: number }>);

    // Calculate dominant emotion and intensity for each location
    const zones = Object.values(locationData).map(({ location, emotions, intensity }) => {
      const categoryCounts = emotions.reduce((acc, emotion) => {
        acc[emotion.category] = (acc[emotion.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
      
      // Enhanced intensity calculation considering recency and consistency
      const now = Date.now();
      const recencyWeight = filteredLogs
        .filter(log => {
          const loc = locationPoints.find(lp => lp.id === log.location_id);
          return loc && Math.abs(loc.latitude - location.latitude) < 0.001 && 
                 Math.abs(loc.longitude - location.longitude) < 0.001;
        })
        .reduce((sum, log) => {
          const logAge = now - new Date(log.timestamp).getTime();
          const hoursAgo = logAge / (1000 * 60 * 60);
          // More recent logs have higher weight (decay over 7 days)
          const weight = Math.max(0, 1 - hoursAgo / (7 * 24));
          return sum + weight;
        }, 0);
      
      const consistencyBonus = emotions.length > 1 ? 
        emotions.filter(e => e.id === emotions[0].id).length / emotions.length : 1;
      
      const baseIntensity = Math.min(intensity / 5, 1);
      const recencyFactor = emotions.length > 0 ? Math.min(recencyWeight / emotions.length, 1) : 0;
      const normalizedIntensity = Math.min(baseIntensity * 0.6 + recencyFactor * 0.3 + consistencyBonus * 0.1, 1);

      return {
        lat: location.latitude,
        lng: location.longitude,
        category: dominantCategory,
        intensity: normalizedIntensity,
        emotions: emotions,
      };
    });

    // Draw gradient zones
    const drawGradients = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      zones.forEach((zone) => {
        const point = map.latLngToContainerPoint([zone.lat, zone.lng]);
        
        // Get color based on emotion category with richer palette
        const getColor = (category: string, intensity: number, emotions: any[]) => {
          // Try to match specific emotion first
          const primaryEmotion = emotions[0];
          const emotionColors: Record<string, string> = {
            'calm': 'rgba(168, 213, 186, 0.5)',
            'relaxed': 'rgba(184, 212, 227, 0.5)',
            'inspired': 'rgba(212, 197, 224, 0.5)',
            'energized': 'rgba(255, 218, 185, 0.5)',
            'anxious': 'rgba(232, 180, 184, 0.5)',
            'down': 'rgba(200, 190, 210, 0.5)',
            'irritated': 'rgba(255, 200, 180, 0.5)',
            'lonely': 'rgba(200, 210, 220, 0.5)',
            'thoughtful': 'rgba(212, 197, 224, 0.5)',
            'foggy': 'rgba(220, 220, 230, 0.5)',
            'numb': 'rgba(200, 200, 210, 0.5)',
          };

          let color = emotionColors[primaryEmotion?.id] || 
            (category === 'positive' ? 'rgba(168, 213, 186, 0.4)' :
             category === 'negative' ? 'rgba(232, 180, 184, 0.4)' :
             category === 'neutral' ? 'rgba(212, 197, 224, 0.4)' : 'rgba(184, 212, 227, 0.4)');
          
          // Enhanced opacity based on intensity (more intense = more opaque)
          const baseOpacity = 0.35 + (intensity * 0.5);
          return color.replace(/[\d.]+\)$/, baseOpacity.toString());
        };

        // Enhanced radius based on intensity (more intense = larger radius)
        const radius = 180 + (zone.intensity * 150); // 180-330px radius
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          radius
        );

        const centerColor = getColor(zone.category, zone.intensity, zone.emotions);
        const edgeColor = getColor(zone.category, 0, zone.emotions);

        gradient.addColorStop(0, centerColor);
        gradient.addColorStop(0.5, centerColor.replace(/[\d.]+\)$/, '0.2)'));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Initial draw
    drawGradients();

    // Redraw on map move/zoom
    const redraw = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawGradients();
    };

    map.on('moveend', redraw);
    map.on('zoomend', redraw);
    map.on('resize', redraw);

    return () => {
      map.off('moveend', redraw);
      map.off('zoomend', redraw);
      map.off('resize', redraw);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, sensoryLogs, locationPoints, visible, timeFilter]);

  return null;
}

