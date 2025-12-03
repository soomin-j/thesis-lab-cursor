import React, { useState, useEffect } from 'react';
import { MockDataService } from '../services/MockDataService';
import './PredictionOverlay.css';

interface PredictionResponse {
  prediction: string;
  confidence: 'high' | 'medium' | 'low';
  likelyEmotions: Array<{ tag: string; probability: number }>;
  likelySensoryTags: Array<{ tag: string; category: string; probability: number }>;
  alternativeSuggestions?: Array<{
    location: { lat: number; lng: number };
    reason: string;
  }>;
}

interface PredictionOverlayProps {
  visible: boolean;
  location: { latitude: number; longitude: number } | null;
  onClose: () => void;
}

export default function PredictionOverlay({
  visible,
  location,
  onClose,
}: PredictionOverlayProps) {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && location) {
      loadPrediction();
    }
  }, [visible, location]);

  const loadPrediction = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const data = await MockDataService.getPrediction(
        location.latitude,
        location.longitude
      );
      setPrediction(data);
    } catch (error) {
      console.error('Error loading prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !location) return null;

  const getConfidenceColor = () => {
    switch (prediction?.confidence) {
      case 'high':
        return '#A8D5BA'; // Soft mint
      case 'medium':
        return '#D4C5E0'; // Soft lavender
      case 'low':
        return '#E8B4B8'; // Soft rose
      default:
        return '#B8D4E3'; // Soft sky
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          <h2>How Might It Feel?</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading">
            <div>Analyzing location...</div>
          </div>
        ) : prediction ? (
          <div className="prediction-content">
            <div className="prediction-box">
              <p className="prediction-text">{prediction.prediction}</p>
              <div className="confidence-badge">
                <span
                  className="confidence-dot"
                  style={{ backgroundColor: getConfidenceColor() }}
                />
                <span className="confidence-text">
                  {prediction.confidence.toUpperCase()} confidence
                </span>
              </div>
            </div>

            {prediction.likelyEmotions.length > 0 && (
              <div className="prediction-section">
                <h3>Likely Emotions</h3>
                <div className="tag-container">
                  {prediction.likelyEmotions.map((item, index) => (
                    <div key={index} className="tag">
                      <span className="tag-text">{item.tag}</span>
                      <span className="probability-text">
                        {Math.round(item.probability * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {prediction.likelySensoryTags.length > 0 && (
              <div className="prediction-section">
                <h3>Expected Sensory Elements</h3>
                <div className="tag-container">
                  {prediction.likelySensoryTags.map((item, index) => (
                    <div key={index} className="tag">
                      <span className="tag-text">{item.tag}</span>
                      <span className="category-text">{item.category}</span>
                      <span className="probability-text">
                        {Math.round(item.probability * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {prediction.alternativeSuggestions &&
              prediction.alternativeSuggestions.length > 0 && (
                <div className="prediction-section">
                  <h3>Alternative Suggestions</h3>
                  {prediction.alternativeSuggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-box">
                      <p>{suggestion.reason}</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ) : (
          <p className="error">Failed to generate prediction</p>
        )}
      </div>
    </div>
  );
}

