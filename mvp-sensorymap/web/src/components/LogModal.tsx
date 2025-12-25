import React, { useState, useEffect } from 'react';
import { MockDataService } from '../services/MockDataService';
import TagSelector from './TagSelector';
import { EmotionTag, SensoryTag } from '../types';
import './LogModal.css';

interface LocationOption {
  name: string;
  latitude: number;
  longitude: number;
}

interface LogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialLocation?: { latitude: number; longitude: number; name?: string } | null;
}

const MOCK_LOCATIONS: LocationOption[] = [
  { name: 'Central Park, New York', latitude: 40.7851, longitude: -73.9683 },
  { name: 'Times Square, New York', latitude: 40.7580, longitude: -73.9855 },
  { name: 'Brooklyn Bridge, New York', latitude: 40.7061, longitude: -73.9969 },
  { name: 'SoHo, New York', latitude: 40.7231, longitude: -74.0026 },
  { name: 'Greenwich Village, New York', latitude: 40.7336, longitude: -74.0027 },
  { name: 'High Line, New York', latitude: 40.7480, longitude: -74.0048 },
];

export default function LogModal({ visible, onClose, onSuccess, initialLocation }: LogModalProps) {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedEmotionTags, setSelectedEmotionTags] = useState<EmotionTag[]>([]);
  const [selectedSensoryTags, setSelectedSensoryTags] = useState<SensoryTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractingTags, setExtractingTags] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  useEffect(() => {
    if (visible && initialLocation) {
      const loc = {
        name: initialLocation.name || `${initialLocation.latitude.toFixed(4)}, ${initialLocation.longitude.toFixed(4)}`,
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude
      };
      setSelectedLocation(loc);
      setLocationSearch(loc.name);
    } else if (!visible) {
      // Reset form on close/invisible if desired, but typically we reset on submit
    }
  }, [visible, initialLocation]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSearch = (value: string) => {
    setLocationSearch(value);
    setShowLocationSuggestions(value.length > 0);
  };

  const handleSelectLocation = (location: LocationOption) => {
    setSelectedLocation(location);
    setLocationSearch(location.name);
    setShowLocationSuggestions(false);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    setLocationSearch('');
    setShowLocationSuggestions(false);
  };

  const filteredLocations = MOCK_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleExtractTags = async () => {
    if (!photo && !description) {
      alert('Please add a photo or description to extract tags');
      return;
    }

    setExtractingTags(true);
    try {
      const extractedTags = await MockDataService.extractTags(photo, description);
      if (extractedTags.emotionTags) {
        setSelectedEmotionTags(extractedTags.emotionTags);
      }
      if (extractedTags.sensoryTags) {
        setSelectedSensoryTags(extractedTags.sensoryTags);
      }
      alert('Tags extracted successfully!');
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to extract tags'));
    } finally {
      setExtractingTags(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert('Please select a location');
      return;
    }
    if (selectedEmotionTags.length === 0 && selectedSensoryTags.length === 0) {
      alert('Please select at least one tag');
      return;
    }

    setLoading(true);
    try {
      await MockDataService.createSensoryLog({
        description,
        emotionTags: JSON.stringify(selectedEmotionTags),
        sensoryTags: JSON.stringify(selectedSensoryTags),
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        photoUrl: photo,
      });

      alert('Sensory log created successfully!');
      
      // Reset form
      setDescription('');
      setPhoto(null);
      setSelectedEmotionTags([]);
      setSelectedSensoryTags([]);
      setSelectedLocation(null);
      setLocationSearch('');
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to create sensory log'));
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="log-modal-overlay" onClick={onClose}>
      <div className="log-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="log-modal-header">
          <h1 className="log-title">Log Your Sensory Experience</h1>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="log-modal-body">
          <form onSubmit={handleSubmit}>
            {/* Photo Section */}
            <div className="log-section">
              <h2 className="section-title">Photo (Optional)</h2>
              {photo ? (
                <div className="photo-preview-container">
                  <img src={photo} alt="Uploaded" className="log-photo" />
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => setPhoto(null)}
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="photo-upload-placeholder">
                  <label htmlFor="modal-photo-upload" className="photo-upload-label">
                    <span className="photo-icon">📷</span>
                    <span className="photo-text">Upload Photo</span>
                  </label>
                  <input
                    id="modal-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="photo-input-hidden"
                  />
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="log-section">
              <h2 className="section-title">Description (Optional)</h2>
              <textarea
                className="description-input"
                placeholder="Describe your sensory experience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Location Point Section */}
            <div className="log-section">
              <h2 className="section-title">Location Point</h2>
              <div className="location-search-container">
                <div className="location-input-wrapper">
                  <span className="location-icon">📍</span>
                  <input
                    type="text"
                    className="location-input"
                    placeholder="Search for a location..."
                    value={locationSearch}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    onFocus={() => setShowLocationSuggestions(locationSearch.length > 0)}
                  />
                  {selectedLocation && (
                    <button
                      type="button"
                      className="clear-location-button"
                      onClick={handleClearLocation}
                      title="Clear location"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {showLocationSuggestions && filteredLocations.length > 0 && (
                  <div className="location-suggestions">
                    {filteredLocations.map((location, index) => (
                      <button
                        key={index}
                        type="button"
                        className="location-suggestion-item"
                        onClick={() => handleSelectLocation(location)}
                      >
                        <span className="suggestion-icon">📍</span>
                        <span className="suggestion-name">{location.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showLocationSuggestions && filteredLocations.length === 0 && locationSearch.length > 0 && (
                  <div className="location-suggestions">
                    <div className="no-location-found">No locations found</div>
                  </div>
                )}
                {selectedLocation && (
                  <div className="selected-location-info">
                    <span className="selected-location-label">Selected:</span>
                    <span className="selected-location-name">{selectedLocation.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Extract Tags Button */}
            {(photo || description) && (
              <button
                type="button"
                className="extract-button"
                onClick={handleExtractTags}
                disabled={extractingTags}
              >
                {extractingTags ? 'Extracting...' : 'Extract Tags with AI'}
              </button>
            )}

            {/* Tag Selection */}
            <div className="log-section">
              <h2 className="section-title">Select Tags</h2>
              <TagSelector
                selectedEmotionTags={selectedEmotionTags}
                selectedSensoryTags={selectedSensoryTags}
                onEmotionTagsChange={setSelectedEmotionTags}
                onSensoryTagsChange={setSelectedSensoryTags}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Log'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}