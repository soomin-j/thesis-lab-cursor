import React, { useState } from 'react';
import { MockDataService } from '../services/MockDataService';
import { EmotionTag, EMOTION_TAGS } from '../types';
import './QuickFeelingModal.css';

interface QuickFeelingModalProps {
  visible: boolean;
  location: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onSuccess?: () => void;
  onLocationChange?: (lat: number, lng: number) => void;
}

export default function QuickFeelingModal({
  visible,
  location,
  onClose,
  onSuccess,
  onLocationChange,
}: QuickFeelingModalProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTag | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmotion || !location) return;

    setLoading(true);
    try {
      await MockDataService.createSensoryLog({
        description,
        emotionTags: JSON.stringify([selectedEmotion]),
        sensoryTags: JSON.stringify([]),
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Reset form
      setSelectedEmotion(null);
      setDescription('');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to save feeling'));
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !location) return null;

  return (
    <div className="quick-feeling-overlay" onClick={onClose}>
      <div className="quick-feeling-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quick-feeling-header">
          <div className="header-top">
            <h2>How are you feeling here?</h2>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
          {location && (
            <div className="location-info">
              <span className="location-icon">📍</span>
              <span className="location-coords">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="emotion-grid">
            {EMOTION_TAGS.map((emotion) => (
              <button
                key={emotion.id}
                type="button"
                className={`emotion-option ${selectedEmotion?.id === emotion.id ? 'selected' : ''}`}
                onClick={() => setSelectedEmotion(emotion)}
              >
                <span className="emotion-emoji-large">{emotion.emoji}</span>
                <span className="emotion-label-small">{emotion.label}</span>
              </button>
            ))}
          </div>

          <textarea
            className="feeling-description"
            placeholder="Add a note (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <button
            type="submit"
            className="save-feeling-button"
            disabled={!selectedEmotion || loading}
          >
            {loading ? 'Saving...' : 'Save Feeling'}
          </button>
        </form>
      </div>
    </div>
  );
}

