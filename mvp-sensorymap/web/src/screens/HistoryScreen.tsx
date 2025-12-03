import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { MockDataService } from '../services/MockDataService';
import { useAuth } from '../store/AuthContext';
import { SensoryLog, LocationPoint } from '../types';
import DailySummaryCard from '../components/DailySummaryCard';
import EmotionPin from '../components/EmotionPin';
import 'leaflet/dist/leaflet.css';
import './HistoryScreen.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
      const logs = await MockDataService.getDailyLogs(user.id, dateStr);
      const locations = await MockDataService.getLocationHistory(user.id);

      setDailyLogs(logs);
      setDailyLocations(locations);

      const calculatedSummary = calculateSummary(logs, locations, selectedDate);
      setSummary(calculatedSummary);
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

    const timeInZones = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    logs.forEach((log) => {
      const dominantEmotion = log.emotion_tags?.[0];
      if (dominantEmotion) {
        const category = dominantEmotion.category;
        if (category === 'positive') timeInZones.positive += 15;
        else if (category === 'negative') timeInZones.negative += 15;
        else timeInZones.neutral += 15;
      }
    });

    return {
      date,
      totalDistance,
      totalLogs: logs.length,
      mostCommonEmotions,
      sensoryPatterns: [],
      timeInZones,
    };
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
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

  // Prepare route data for map
  const routeCoordinates: LatLngExpression[] = dailyLocations
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map((point) => [point.latitude, point.longitude]);

  const startLocation = dailyLocations.length > 0 
    ? dailyLocations.reduce((earliest, current) => 
        current.timestamp < earliest.timestamp ? current : earliest
      )
    : null;

  const endLocation = dailyLocations.length > 0
    ? dailyLocations.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      )
    : null;

  const mapCenter: LatLngExpression = routeCoordinates.length > 0
    ? routeCoordinates[Math.floor(routeCoordinates.length / 2)]
    : [40.7128, -74.0060];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDuration = () => {
    if (!startLocation || !endLocation) return 'N/A';
    const duration = endLocation.timestamp.getTime() - startLocation.timestamp.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="history-screen">
      <div className="date-nav">
        <button onClick={() => changeDate(-1)}>← Previous</button>
        <span className="date-text">
          {selectedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <button onClick={() => changeDate(1)}>Next →</button>
      </div>

      <div className="history-content">
        {/* Route Map Section */}
        {dailyLocations.length > 0 && (
          <div className="route-section">
            <div className="route-header">
              <h2 className="route-title">Your Route</h2>
              <div className="route-stats">
                <div className="route-stat">
                  <span className="stat-label">Distance</span>
                  <span className="stat-value">
                    {summary ? (summary.totalDistance < 1000 
                      ? `${Math.round(summary.totalDistance)}m` 
                      : `${(summary.totalDistance / 1000).toFixed(2)}km`) : '0m'}
                  </span>
                </div>
                {startLocation && endLocation && (
                  <div className="route-stat">
                    <span className="stat-label">Duration</span>
                    <span className="stat-value">{formatDuration()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="route-map-container">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  opacity={0.85}
                />

                {/* Route Path */}
                {routeCoordinates.length > 1 && (
                  <Polyline
                    positions={routeCoordinates}
                    color="#D4C5E0"
                    weight={6}
                    opacity={0.7}
                  />
                )}

                {/* Start Marker */}
                {startLocation && (
                  <Marker
                    position={[startLocation.latitude, startLocation.longitude]}
                    icon={L.divIcon({
                      className: 'route-marker start-marker',
                      html: `
                        <div style="
                          width: 32px;
                          height: 32px;
                          border-radius: 50%;
                          background: #A8D5BA;
                          border: 3px solid white;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 18px;
                        ">🚶</div>
                      `,
                      iconSize: [32, 32],
                      iconAnchor: [16, 16],
                    })}
                  >
                    <Popup>
                      <div className="route-popup">
                        <strong>Start</strong>
                        <br />
                        {formatTime(startLocation.timestamp)}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* End Marker */}
                {endLocation && (
                  <Marker
                    position={[endLocation.latitude, endLocation.longitude]}
                    icon={L.divIcon({
                      className: 'route-marker end-marker',
                      html: `
                        <div style="
                          width: 32px;
                          height: 32px;
                          border-radius: 50%;
                          background: #E8B4B8;
                          border: 3px solid white;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 18px;
                        ">🏁</div>
                      `,
                      iconSize: [32, 32],
                      iconAnchor: [16, 16],
                    })}
                  >
                    <Popup>
                      <div className="route-popup">
                        <strong>End</strong>
                        <br />
                        {formatTime(endLocation.timestamp)}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Sensory Log Markers */}
                {dailyLogs.map((log) => {
                  const locationPoint = dailyLocations.find((lp) => lp.id === log.location_id);
                  if (!locationPoint || !log.emotion_tags?.[0]) return null;

                  return (
                    <Marker
                      key={log.id}
                      position={[locationPoint.latitude, locationPoint.longitude]}
                      icon={EmotionPin.createIcon(log.emotion_tags[0])}
                    >
                      <Popup>
                        <div className="route-popup">
                          <strong>{log.description || 'Sensory log'}</strong>
                          <br />
                          {log.emotion_tags[0].emoji} {log.emotion_tags[0].label}
                          <br />
                          <small>{formatTime(new Date(log.timestamp))}</small>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Route Timeline */}
            {startLocation && endLocation && (
              <div className="route-timeline">
                <div className="timeline-item">
                  <div className="timeline-marker start"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{formatTime(startLocation.timestamp)}</div>
                    <div className="timeline-label">Started</div>
                  </div>
                </div>
                {dailyLogs.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-marker log"></div>
                    <div className="timeline-content">
                      <div className="timeline-time">{dailyLogs.length} log{dailyLogs.length !== 1 ? 's' : ''}</div>
                      <div className="timeline-label">Sensory experiences</div>
                    </div>
                  </div>
                )}
                <div className="timeline-item">
                  <div className="timeline-marker end"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{formatTime(endLocation.timestamp)}</div>
                    <div className="timeline-label">Ended</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily Summary Card */}
        {summary && <DailySummaryCard summary={summary} />}
      </div>
    </div>
  );
}

