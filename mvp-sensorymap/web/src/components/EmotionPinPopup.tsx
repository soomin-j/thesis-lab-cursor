import React, { useEffect, useState } from 'react';
import { SensoryLog, LocationPoint } from '../types';
import { ContextService } from '../services/ContextService';
import './EmotionPinPopup.css';

interface EmotionPinPopupProps {
  log: SensoryLog;
  isOwnLog: boolean;
  locationName?: string;
  allLogs?: SensoryLog[];
  allLocationPoints?: LocationPoint[];
}

export default function EmotionPinPopup({
  log,
  isOwnLog,
  locationName,
  allLogs = [],
  allLocationPoints = [],
}: EmotionPinPopupProps) {
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (allLogs.length > 0 && allLocationPoints.length > 0 && log.location_id) {
      const location = allLocationPoints.find((lp) => lp.id === log.location_id);
      if (location) {
        const contextualInsights = ContextService.analyzeLocationPatterns(
          allLogs,
          allLocationPoints,
          location.latitude,
          location.longitude
        );
        setInsights(contextualInsights);
      }
    }
  }, [log.location_id, allLogs, allLocationPoints]);
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group sensory tags by category
  const sensoryByCategory = log.sensory_tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, typeof log.sensory_tags>);

  const categoryLabels: Record<string, string> = {
    sound: 'Sound',
    light: 'Light',
    air: 'Air/Touch',
    smell: 'Smell',
    space: 'Space',
  };

  return (
    <div className="emotion-pin-popup">
      {/* Header */}
      <div className="popup-header">
        <div className="popup-header-top">
          <span className={`popup-badge ${isOwnLog ? 'own-log' : 'community-log'}`}>
            {isOwnLog ? 'Your log' : 'Community'}
          </span>
          {log.ai_extracted && (
            <span className="popup-ai-badge">AI</span>
          )}
        </div>
        <div className="popup-emotion">
          <span className="popup-emoji-large">{log.emotion_tags[0]?.emoji}</span>
          <div className="popup-emotion-info">
            <div className="popup-emotion-label">{log.emotion_tags[0]?.label}</div>
            {log.emotion_tags.length > 1 && (
              <div className="popup-emotion-count">+{log.emotion_tags.length - 1} more</div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {log.description && (
        <div className="popup-description">
          <p>{log.description}</p>
        </div>
      )}

      {/* Location */}
      {locationName && (
        <div className="popup-location">
          <span className="popup-location-icon">📍</span>
          <span className="popup-location-name">{locationName}</span>
        </div>
      )}

      {/* All Emotions */}
      {log.emotion_tags.length > 1 && (
        <div className="popup-section">
          <div className="popup-section-title">Emotions</div>
          <div className="popup-tags-list">
            {log.emotion_tags.map((emotion, index) => (
              <span key={index} className="popup-tag emotion-tag">
                {emotion.emoji} {emotion.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sensory Tags */}
      {log.sensory_tags.length > 0 && (
        <div className="popup-section">
          <div className="popup-section-title">Sensory Elements</div>
          {Object.entries(sensoryByCategory).map(([category, tags]) => (
            <div key={category} className="popup-sensory-category">
              <div className="popup-category-label">{categoryLabels[category] || category}</div>
              <div className="popup-tags-list">
                {tags.map((tag, index) => (
                  <span key={index} className="popup-tag sensory-tag">
                    {tag.emoji} {tag.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contextual Insights */}
      {insights && (insights.timePatterns.length > 0 || insights.crowdPattern || insights.trend) && (
        <div className="popup-section">
          <div className="popup-section-title">Insights</div>
          {insights.timePatterns.length > 0 && (
            <div className="popup-insight-item">
              <span className="insight-icon">⏰</span>
              <div className="insight-content">
                {insights.timePatterns.map((pattern: any, index: number) => (
                  <div key={index} className="insight-text">
                    {pattern.timeOfDay}: Mostly {pattern.dominantEmotion} ({pattern.percentage}%)
                  </div>
                ))}
              </div>
            </div>
          )}
          {insights.crowdPattern && (
            <div className="popup-insight-item">
              <span className="insight-icon">👥</span>
              <span className="insight-text">{insights.crowdPattern}</span>
            </div>
          )}
          {insights.trend && (
            <div className="popup-insight-item">
              <span className="insight-icon">📈</span>
              <span className="insight-text">{insights.trend}</span>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="popup-footer">
        <div className="popup-timestamp">
          <span className="popup-time-icon">🕐</span>
          <span>{formatDate(log.timestamp)} at {formatTime(log.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

