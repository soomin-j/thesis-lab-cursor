import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MockDataService } from '../services/MockDataService';
import { useAuth } from '../store/AuthContext';
import { LocationPoint, SensoryLog } from '../types';
import SensorySummaryOverlay from '../components/SensorySummaryOverlay';
import PredictionOverlay from '../components/PredictionOverlay';
import LogModal from '../components/LogModal';
import ColorZoneOverlay from '../components/ColorZoneOverlay';
import AmbientGradientOverlay, { TimeFilter } from '../components/AmbientGradientOverlay';
import SensoryHeatmapOverlay, { SensoryCategory } from '../components/SensoryHeatmapOverlay';
import EmotionPath from '../components/EmotionPath';
import TimeFilterComponent from '../components/TimeFilter';
import TimeFilterModal from '../components/TimeFilterModal';
import SensoryLayerControls from '../components/SensoryLayerControls';
import SensoryFilterModal from '../components/SensoryFilterModal';
import EmotionPin from '../components/EmotionPin';
import EmotionPinPopup from '../components/EmotionPinPopup';
import OnboardingTour from '../components/OnboardingTour';
import Tooltip from '../components/Tooltip';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';

interface LocationOption {
  name: string;
  latitude: number;
  longitude: number;
}

const MOCK_LOCATIONS: LocationOption[] = [
  { name: 'Central Park, New York', latitude: 40.7851, longitude: -73.9683 },
  { name: 'Times Square, New York', latitude: 40.7580, longitude: -73.9855 },
  { name: 'Brooklyn Bridge, New York', latitude: 40.7061, longitude: -73.9969 },
  { name: 'SoHo, New York', latitude: 40.7231, longitude: -74.0026 },
  { name: 'Greenwich Village, New York', latitude: 40.7336, longitude: -74.0027 },
  { name: 'High Line, New York', latitude: 40.7480, longitude: -74.0048 },
  { name: 'Empire State Building, New York', latitude: 40.7484, longitude: -73.9857 },
  { name: 'Statue of Liberty, New York', latitude: 40.6892, longitude: -74.0445 },
  { name: 'Washington Square Park, New York', latitude: 40.7308, longitude: -73.9973 },
  { name: 'Chelsea Market, New York', latitude: 40.7420, longitude: -74.0048 },
];

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

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
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
  const [selectedFeelingLocation, setSelectedFeelingLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);
  const [showSensoryFilterModal, setShowSensoryFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationOption[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(13);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadLocationHistory();
      loadSensoryLogs();
      loadAllUsersData();
      
      // Check if onboarding has been completed
      if (typeof window !== 'undefined') {
        const onboardingCompleted = localStorage.getItem('sensescape-onboarding-completed');
        if (!onboardingCompleted) {
          // Show onboarding after a short delay
          setTimeout(() => setShowOnboarding(true), 500);
        }
      }
    }
  }, [user]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const searchBar = document.querySelector('.map-search-bar');
      if (searchBar && !searchBar.contains(target)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSearchResults]);

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
      // Update map center to first location if available
      if (data.length > 0 && mapCenter[0] === 40.7128 && mapCenter[1] === -74.0060) {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
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
    // Don't open summary on map click - user must use the button
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

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const filtered = MOCK_LOCATIONS.filter((loc) =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle location selection from search
  const handleSelectLocation = (location: LocationOption) => {
    setSearchQuery(location.name);
    setShowSearchResults(false);
    setMapCenter([location.latitude, location.longitude]);
    setMapZoom(15);
    // Set selected location but don't auto-open summary
    setSelectedLocation({ latitude: location.latitude, longitude: location.longitude });
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectLocation(searchResults[0]);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Sensory category options for display
  const categories: { value: SensoryCategory; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🌐' },
    { value: 'sound', label: 'Sound', icon: '🔊' },
    { value: 'light', label: 'Light', icon: '💡' },
    { value: 'smell', label: 'Smell', icon: '👃' },
    { value: 'space', label: 'Space', icon: '🏞️' },
    { value: 'air', label: 'Air', icon: '🌬️' },
  ];

  // Time filter options for display
  const timeOptions: { value: TimeFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All Time', icon: '🕐' },
    { value: 'morning', label: 'Morning', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
    { value: 'evening', label: 'Evening', icon: '🌆' },
    { value: 'night', label: 'Night', icon: '🌙' },
    { value: 'current', label: 'Now', icon: '✨' },
  ];

  // Get current time string
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="map-screen">
      {/* Header / Status Area - Social Map Style */}
      <div className="map-header-status">
        <div className="status-info-pill">
          <span>{getCurrentTime()}</span>
          <span>•</span>
          <span>43°F</span>
          <span>☁️</span>
        </div>
      </div>

      {/* Search Bar - Moved to top right */}
      <div className="map-search-bar" onBlur={(e) => {
        // Don't close if clicking on search results
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setTimeout(() => setShowSearchResults(false), 200);
        }
      }}>
        <span className="search-icon">🔍</span>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex' }}>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (searchQuery.length > 0) {
                setShowSearchResults(true);
              }
            }}
          />
        </form>
        {searchQuery.length > 0 && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClearSearch}
            title="Clear search"
          >
            ✕
          </button>
        )}
        
        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((location, index) => (
              <button
                key={index}
                type="button"
                className="search-result-item"
                onClick={() => handleSelectLocation(location)}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur
              >
                <span className="result-icon">📍</span>
                <span className="result-name">{location.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          opacity={1}
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

        {/* Current Location Indicator - Sticker Style */}
        <Marker
          position={mapCenter}
          icon={L.divIcon({
            className: 'current-location-marker',
            html: `
              <div style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #4A90E2;
                border: 4px solid #ffffff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                animation: pulse 3s ease-in-out infinite;
              ">
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        />


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
      <Tooltip content="Add your feeling with emotions, sensory tags, and photos">
        <button
          className="fab-add-feeling"
          onClick={() => {
            // Open log modal directly with current map center as location
            setSelectedFeelingLocation({
              latitude: mapCenter[0],
              longitude: mapCenter[1]
            });
            setShowQuickFeeling(true);
            setShowSummary(false);
            setShowPrediction(false);
          }}
        >
          <span className="fab-icon">+</span>
          <span className="fab-label">Add Feeling</span>
        </button>
      </Tooltip>


      {/* Map Controls */}
      <div className="map-view-controls">
        <Tooltip content="Show collective emotional atmosphere overlays on the map">
          <button
            className={`map-control-button ${showAmbientView ? 'active' : ''}`}
            onClick={() => {
              setShowAmbientView(true);
              setShowTimeFilterModal(true);
            }}
          >
            <span className="control-icon">
              {timeFilter !== 'all' ? timeOptions.find((t) => t.value === timeFilter)?.icon || '🌫️' : '🌫️'}
            </span>
            <span className="control-label">
              {timeFilter !== 'all'
                ? `Atmosphere: ${timeOptions.find((t) => t.value === timeFilter)?.label || 'All Time'}`
                : 'Atmosphere'}
            </span>
          </button>
        </Tooltip>
        <Tooltip content="Visualize specific sensory elements like sound, light, and smell">
          <button
            className={`map-control-button sensory-filter-button ${showSensoryLayers ? 'active' : ''}`}
            onClick={() => {
              if (!showSensoryLayers) {
                setShowSensoryLayers(true);
              }
              setShowSensoryFilterModal(true);
            }}
          >
            <span className="control-icon">
              {showSensoryLayers && sensoryCategory !== 'all'
                ? categories.find((c) => c.value === sensoryCategory)?.icon || '🎨'
                : '🎨'}
            </span>
            <span className="control-label">
              {showSensoryLayers && sensoryCategory !== 'all'
                ? `Sensory: ${categories.find((c) => c.value === sensoryCategory)?.label || 'All'}`
                : 'Sensory'}
            </span>
          </button>
        </Tooltip>
        <Tooltip content="Take a guided tour of SenseScape features">
          <button
            className="map-control-button help-button"
            onClick={() => setShowOnboarding(true)}
            title="Show help and tour"
          >
            <span className="control-icon">❓</span>
            <span className="control-label">Help</span>
          </button>
        </Tooltip>
      </div>

      {/* Sensory Summary Button - Left Bottom */}
      <div className="sensory-summary-button-container">
        <Tooltip content="View sensory summary for this location">
          <button
            className={`sensory-summary-button ${showSummary ? 'active' : ''}`}
            onClick={() => {
              if (!selectedLocation) {
                // If no location selected, use current map center
                setSelectedLocation({ latitude: mapCenter[0], longitude: mapCenter[1] });
              }
              setShowSummary(true);
            }}
          >
            <span className="summary-button-icon">📊</span>
            <span className="summary-button-label">Sensory Summary</span>
          </button>
        </Tooltip>
      </div>

      {/* Welcome Message for First-Time Users */}
      {typeof window !== 'undefined' && !localStorage.getItem('sensescape-onboarding-completed') && !showOnboarding && (
        <div className="welcome-message">
          <div className="welcome-content">
            <h3>Welcome to SenseScape! 🌈</h3>
            <p>Click anywhere on the map to explore sensory experiences, or add your own feelings.</p>
            <button className="welcome-button" onClick={() => setShowOnboarding(true)}>
              Take a Tour
            </button>
          </div>
        </div>
      )}

      {/* Time Filter Modal */}
      <TimeFilterModal
        visible={showTimeFilterModal}
        selectedTime={timeFilter}
        onTimeChange={setTimeFilter}
        onClose={() => setShowTimeFilterModal(false)}
      />

      {/* Sensory Filter Modal */}
      <SensoryFilterModal
        visible={showSensoryFilterModal}
        selectedCategory={sensoryCategory}
        onCategoryChange={setSensoryCategory}
        onClose={() => setShowSensoryFilterModal(false)}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />

      <LogModal
        visible={showQuickFeeling}
        initialLocation={selectedFeelingLocation || currentLocation || { latitude: 40.7128, longitude: -74.0060 }}
        onClose={() => {
          setShowQuickFeeling(false);
          setSelectedFeelingLocation(null);
        }}
        onSuccess={handleQuickFeelingSuccess}
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
