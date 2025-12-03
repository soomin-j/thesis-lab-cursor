import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { SensoryLog, LocationPoint, SensoryTag } from '../types';

export type SensoryCategory = 'sound' | 'light' | 'air' | 'smell' | 'space' | 'all';

interface SensoryHeatmapOverlayProps {
  sensoryLogs: SensoryLog[];
  locationPoints: LocationPoint[];
  visible: boolean;
  category: SensoryCategory;
}

export default function SensoryHeatmapOverlay({
  sensoryLogs,
  locationPoints,
  visible,
  category,
}: SensoryHeatmapOverlayProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!visible || sensoryLogs.length === 0 || category === 'all') return;

    // Filter logs by sensory category
    const filteredLogs = sensoryLogs.filter((log) => {
      if (!log.location_id) return false;
      return log.sensory_tags.some((tag) => tag.category === category);
    });

    if (filteredLogs.length === 0) return;

    // Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '350';
    canvas.style.opacity = '0.6';
    canvas.style.mixBlendMode = 'multiply';

    const container = map.getContainer();
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    container.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Group logs by location and calculate sensory intensity
    const locationData = filteredLogs.reduce((acc, log) => {
      if (!log.location_id) return acc;

      const location = locationPoints.find((lp) => lp.id === log.location_id);
      if (!location) return acc;

      const key = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
      if (!acc[key]) {
        acc[key] = {
          location,
          tags: [],
          intensity: 0,
        };
      }

      const categoryTags = log.sensory_tags.filter((tag) => tag.category === category);
      acc[key].tags.push(...categoryTags);
      acc[key].intensity += categoryTags.length;
      return acc;
    }, {} as Record<string, { location: LocationPoint; tags: SensoryTag[]; intensity: number }>);

    // Get color scheme for category
    const getCategoryColors = (cat: SensoryCategory) => {
      switch (cat) {
        case 'sound':
          return {
            low: 'rgba(184, 212, 227, 0.3)', // Soft blue (quiet)
            high: 'rgba(100, 150, 200, 0.6)', // Deeper blue (loud)
          };
        case 'light':
          return {
            low: 'rgba(255, 240, 200, 0.3)', // Soft yellow (dim)
            high: 'rgba(255, 200, 100, 0.6)', // Bright yellow (bright)
          };
        case 'smell':
          return {
            low: 'rgba(200, 220, 180, 0.3)', // Soft green (nature)
            high: 'rgba(150, 120, 100, 0.6)', // Brown (pollution)
          };
        case 'space':
          return {
            low: 'rgba(220, 200, 240, 0.3)', // Soft purple (spacious)
            high: 'rgba(180, 150, 200, 0.6)', // Deeper purple (crowded)
          };
        case 'air':
          return {
            low: 'rgba(255, 200, 180, 0.3)', // Soft orange (warm)
            high: 'rgba(180, 200, 255, 0.6)', // Soft blue (cool)
          };
        default:
          return {
            low: 'rgba(200, 200, 200, 0.3)',
            high: 'rgba(150, 150, 150, 0.6)',
          };
      }
    };

    const colors = getCategoryColors(category);

    // Draw heatmap zones
    const drawHeatmap = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      Object.values(locationData).forEach(({ location, tags, intensity }) => {
        const point = map.latLngToContainerPoint([location.latitude, location.longitude]);

        // Normalize intensity (0-1)
        const normalizedIntensity = Math.min(intensity / 10, 1);

        // Interpolate color based on intensity
        const color = normalizedIntensity < 0.5
          ? colors.low
          : colors.high;

        const radius = 120 + (normalizedIntensity * 100); // 120-220px
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          radius
        );

        const centerOpacity = 0.4 + (normalizedIntensity * 0.4);
        const centerColor = color.replace(/[\d.]+\)$/, centerOpacity.toString());
        const edgeColor = color.replace(/[\d.]+\)$/, '0.1)');

        gradient.addColorStop(0, centerColor);
        gradient.addColorStop(0.5, centerColor.replace(/[\d.]+\)$/, '0.2)'));
        gradient.addColorStop(1, edgeColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Initial draw
    drawHeatmap();

    // Redraw on map move/zoom
    const redraw = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawHeatmap();
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
  }, [map, sensoryLogs, locationPoints, visible, category]);

  return null;
}

