import React, { useState, useEffect } from 'react';
import { MockDataService } from '../services/MockDataService';
import './SensorySummaryOverlay.css';

interface AggregatedTag {
  tag: {
    id: string;
    emoji: string;
    label: string;
    category: string;
  };
  percentage: number;
  count: number;
}

interface SensorySummary {
  location: { lat: number; lng: number };
  radius: number;
  totalReviews: number;
  topEmotions: AggregatedTag[];
  topSensoryTags: AggregatedTag[];
  lastUpdated: Date;
}

interface SensorySummaryOverlayProps {
  visible: boolean;
  location: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onRequestPrediction?: () => void;
}

export default function SensorySummaryOverlay({
  visible,
  location,
  onClose,
  onRequestPrediction,
}: SensorySummaryOverlayProps) {
  const [summary, setSummary] = useState<SensorySummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && location) {
      loadSummary();
    }
  }, [visible, location]);

  const loadSummary = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const data = await MockDataService.getSensorySummary(
        location.latitude,
        location.longitude
      );
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !location) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          <h2>Sensory Summary</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : summary ? (
          <div className="summary-content">
            <p className="summary-subtitle">
              Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
            </p>

            {summary.topEmotions.length > 0 && (
              <div className="summary-section">
                <h3>Top Emotions</h3>
                {summary.topEmotions.map((item, index) => (
                  <div key={index} className="tag-row">
                    <span className="tag-emoji">{item.tag.emoji}</span>
                    <span className="tag-label">{item.tag.label}</span>
                    <div className="percentage-bar">
                      <div
                        className="percentage-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="percentage-text">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            )}

            {summary.topSensoryTags.length > 0 && (
              <div className="summary-section">
                <h3>Sensory Elements</h3>
                {summary.topSensoryTags.map((item, index) => (
                  <div key={index} className="tag-row">
                    <span className="tag-emoji">{item.tag.emoji}</span>
                    <span className="tag-label">{item.tag.label}</span>
                    <div className="percentage-bar">
                      <div
                        className="percentage-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="percentage-text">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            )}

            {summary.totalReviews === 0 && (
              <p className="no-data">No reviews available for this location yet.</p>
            )}
          </div>
        ) : (
          <p className="error">Failed to load summary</p>
        )}

        {onRequestPrediction && (
          <button className="prediction-button" onClick={onRequestPrediction}>
            How Might It Feel?
          </button>
        )}
      </div>
    </div>
  );
}

