import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MockDataService } from '../services/MockDataService';
import { useAuth } from '../store/AuthContext';
import { LocationPoint, SensoryLog } from '../types';
import SensorySummaryOverlay from '../components/SensorySummaryOverlay';
import PredictionOverlay from '../components/PredictionOverlay';
import QuickFeelingModal from '../components/QuickFeelingModal';
import ColorZoneOverlay from '../components/ColorZoneOverlay';
import AmbientGradientOverlay, { TimeFilter } from '../components/AmbientGradientOverlay';
import SensoryHeatmapOverlay, { SensoryCategory } from '../components/SensoryHeatmapOverlay';
import EmotionPath from '../components/EmotionPath';
import TimeFilterComponent from '../components/TimeFilter';
import SensoryLayerControls from '../components/SensoryLayerControls';
import EmotionPin from '../components/EmotionPin';
import EmotionPinPopup from '../components/EmotionPinPopup';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapScreen() {
  const { user } = useAuth();
  const [locationPoints, setLocationPoints] = useState<LocationPoint[]>([]);
  const [sensoryLogs, setSensoryLogs] = useState<SensoryLog[]>([]);
  const [allUsersLogs, setAllUsersLogs] = useState<SensoryLog[]>([]);
  const [allLocationPoints, setAllLocationPoints] = useState<LocationPoint[]>([]);
  const [showAmbientView, setShowAmbientView] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sensoryCategory, setSensoryCategory] = useState<SensoryCategory>('all');
  const [showSensoryLayers, setShowSensoryLayers] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showQuickFeeling, setShowQuickFeeling] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedFeelingLocation, setSelectedFeelingLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadLocationHistory();
      loadSensoryLogs();
      loadAllUsersData();
    }
  }, [user]);

  // Refresh data when component becomes visible (e.g., when navigating back from LogScreen)
  useEffect(() => {
    if (user) {
      const handleFocus = () => {
        // Refresh data when window regains focus
        loadLocationHistory();
        loadSensoryLogs();
        loadAllUsersData();
      };

      window.addEventListener('focus', handleFocus);

      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user]);

  const loadLocationHistory = async () => {
    if (!user) return;
    try {
      const data = await MockDataService.getLocationHistory(user.id);
      setLocationPoints(data);
    } catch (error) {
      console.error('Error loading location history:', error);
    }
  };

  const loadSensoryLogs = async () => {
    if (!user) return;
    try {
      const data = await MockDataService.getSensoryLogs(user.id);
      setSensoryLogs(data);
    } catch (error) {
      console.error('Error loading sensory logs:', error);
    }
  };

  const loadAllUsersData = async () => {
    try {
      const [logs, locations] = await Promise.all([
        MockDataService.getAllUsersLogs(),
        MockDataService.getAllLocationPoints(),
      ]);
      setAllUsersLogs(logs);
      setAllLocationPoints(locations);
    } catch (error) {
      console.error('Error loading all users data:', error);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectingLocation) {
      // User is selecting location for adding feeling
      setSelectedFeelingLocation({ latitude: lat, longitude: lng });
      setIsSelectingLocation(false);
      setShowQuickFeeling(true);
    } else {
      // Normal map click - show summary
      setSelectedLocation({ latitude: lat, longitude: lng });
      setShowSummary(true);
    }
  };

  const handleQuickFeelingSuccess = () => {
    // Reload logs and location data after adding feeling
    loadSensoryLogs();
    loadLocationHistory();
    loadAllUsersData();
  };

  const handleRequestPrediction = () => {
    setShowSummary(false);
    setShowPrediction(true);
  };

  // Center on first location or default to New York City
  const center: [number, number] =
    locationPoints.length > 0
      ? [locationPoints[0].latitude, locationPoints[0].longitude]
      : [40.7128, -74.0060];

  return (
    <div className="map-screen">
      {/* Search Bar */}
      <div className="map-search-bar">
        <span className="search-icon">📍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a place..."
          readOnly
        />
        <span className="search-check">✓</span>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          opacity={0.85}
        />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Ambient Gradient Overlay - shows collective atmosphere */}
        {showAmbientView && (
          <AmbientGradientOverlay
            sensoryLogs={allUsersLogs}
            locationPoints={allLocationPoints}
            visible={showAmbientView}
            timeFilter={timeFilter}
          />
        )}

        {/* Color zones for emotional resonance (user's own data) */}
        <ColorZoneOverlay sensoryLogs={sensoryLogs} locationPoints={locationPoints} />

        {/* Sensory-specific heatmap overlay */}
        {showSensoryLayers && (
          <SensoryHeatmapOverlay
            sensoryLogs={allUsersLogs}
            locationPoints={allLocationPoints}
            visible={showSensoryLayers}
            category={sensoryCategory}
          />
        )}

        {/* Emotion-coded path showing mood transitions */}
        <EmotionPath locationPoints={locationPoints} sensoryLogs={sensoryLogs} />

        {/* Current Location Indicator - soft and ambient */}
        <Marker
          position={center}
          icon={L.divIcon({
            className: 'current-location-marker',
            html: `
              <div style="
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #B8D4E3;
                border: 3px solid rgba(184, 212, 227, 0.4);
                box-shadow: 0 0 0 6px rgba(184, 212, 227, 0.2), 0 0 0 12px rgba(184, 212, 227, 0.1);
                animation: pulse 3s ease-in-out infinite;
              ">
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />

        {/* Location Selection Marker - shows where user clicked for adding feeling */}
        {isSelectingLocation && selectedFeelingLocation && (
          <Marker
            position={[selectedFeelingLocation.latitude, selectedFeelingLocation.longitude]}
            icon={L.divIcon({
              className: 'location-selection-marker',
              html: `
                <div style="
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: rgba(168, 213, 186, 0.9);
                  border: 3px solid #A8D5BA;
                  box-shadow: 0 0 0 8px rgba(168, 213, 186, 0.3), 0 0 0 16px rgba(168, 213, 186, 0.1);
                  animation: pulse-selection 2s ease-in-out infinite;
                ">
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          />
        )}

        {/* Location Selection Hint */}
        {isSelectingLocation && (
          <div className="location-selection-hint">
            <div className="hint-content">
              <span className="hint-icon">📍</span>
              <span className="hint-text">Click on the map to select a location</span>
            </div>
          </div>
        )}

        {/* Location markers with emotion pins - show all users' logs */}
        {allUsersLogs.map((log) => {
          const locationPoint = allLocationPoints.find((lp) => lp.id === log.location_id) ||
                               locationPoints.find((lp) => lp.id === log.location_id);
          if (!locationPoint || !log.emotion_tags?.[0]) return null;

          const isOwnLog = log.user_id === user?.id;

          return (
            <Marker
              key={log.id}
              position={[locationPoint.latitude, locationPoint.longitude]}
              icon={EmotionPin.createIcon(log.emotion_tags[0])}
            >
              <Popup maxWidth={350}>
                <div className="emotion-pin-popup-wrapper">
                  <EmotionPinPopup 
                    log={log} 
                    isOwnLog={isOwnLog}
                    locationName={undefined} // Could be enhanced with reverse geocoding
                    allLogs={allUsersLogs}
                    allLocationPoints={allLocationPoints}
                  />
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Action Button for Quick Feeling */}
      <button
        className={`fab-add-feeling ${isSelectingLocation ? 'selecting' : ''}`}
        onClick={() => {
          if (isSelectingLocation) {
            // Cancel selection mode
            setIsSelectingLocation(false);
            setSelectedFeelingLocation(null);
          } else {
            // Enter location selection mode
            setIsSelectingLocation(true);
            setShowSummary(false);
            setShowPrediction(false);
          }
        }}
        title={isSelectingLocation ? "Click on map to select location (or click here to cancel)" : "Add your feeling"}
      >
        <span className="fab-icon">{isSelectingLocation ? '✕' : '+'}</span>
        <span className="fab-label">{isSelectingLocation ? 'Cancel' : 'Add Feeling'}</span>
      </button>

      {/* Time Filter */}
      {showAmbientView && (
        <div className="time-filter-panel">
          <TimeFilterComponent selectedTime={timeFilter} onTimeChange={setTimeFilter} />
        </div>
      )}

      {/* Sensory Layer Controls */}
      {showSensoryLayers && (
        <div className="sensory-controls-panel">
          <SensoryLayerControls
            selectedCategory={sensoryCategory}
            onCategoryChange={setSensoryCategory}
            visible={showSensoryLayers}
          />
        </div>
      )}

      {/* Map Controls */}
      <div className="map-view-controls">
        <button
          className={`map-control-button ${showAmbientView ? 'active' : ''}`}
          onClick={() => setShowAmbientView(!showAmbientView)}
          title="Toggle ambient atmosphere view"
        >
          <span className="control-icon">🌫️</span>
          <span className="control-label">Atmosphere</span>
        </button>
        <button
          className={`map-control-button ${showSensoryLayers ? 'active' : ''}`}
          onClick={() => setShowSensoryLayers(!showSensoryLayers)}
          title="Toggle sensory layers"
        >
          <span className="control-icon">🎨</span>
          <span className="control-label">Sensory</span>
        </button>
      </div>

      <div className="map-controls">
        <button
          className="map-button"
          onClick={() => {
            setSelectedLocation({ latitude: 40.7128, longitude: -74.0060 });
            setShowSummary(true);
          }}
        >
          View Summary
        </button>
        <button
          className="map-button"
          onClick={() => {
            setSelectedLocation({ latitude: 40.7128, longitude: -74.0060 });
            setShowPrediction(true);
          }}
        >
          How Might It Feel?
        </button>
      </div>

      <QuickFeelingModal
        visible={showQuickFeeling}
        location={selectedFeelingLocation || currentLocation || { latitude: 40.7128, longitude: -74.0060 }}
        onClose={() => {
          setShowQuickFeeling(false);
          setSelectedFeelingLocation(null);
          setIsSelectingLocation(false);
        }}
        onSuccess={handleQuickFeelingSuccess}
        onLocationChange={(lat, lng) => {
          setSelectedFeelingLocation({ latitude: lat, longitude: lng });
        }}
      />

      <SensorySummaryOverlay
        visible={showSummary}
        location={selectedLocation}
        onClose={() => {
          setShowSummary(false);
          setSelectedLocation(null);
        }}
        onRequestPrediction={handleRequestPrediction}
      />

      <PredictionOverlay
        visible={showPrediction}
        location={selectedLocation}
        onClose={() => {
          setShowPrediction(false);
          setSelectedLocation(null);
        }}
      />
    </div>
  );
}
