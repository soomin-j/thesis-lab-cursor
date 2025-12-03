import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MockDataService } from '../services/MockDataService';

// Use mock data instead of API
const USE_MOCK_DATA = true;

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
      if (USE_MOCK_DATA) {
        const data = await MockDataService.getPrediction(
          location.latitude,
          location.longitude
        );
        setPrediction(data);
      } else {
        // const response = await api.post('/predictions/feel', {
        //   latitude: location.latitude,
        //   longitude: location.longitude,
        // });
        // setPrediction(response.data);
      }
    } catch (error) {
      console.error('Error loading prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !location) {
    return null;
  }

  const getConfidenceColor = () => {
    switch (prediction?.confidence) {
      case 'high':
        return '#34C759';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>How Might It Feel?</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Analyzing location...</Text>
            </View>
          ) : prediction ? (
            <ScrollView style={styles.content}>
              {/* Main Prediction */}
              <View style={styles.predictionBox}>
                <Text style={styles.predictionText}>{prediction.prediction}</Text>
                <View style={styles.confidenceBadge}>
                  <View
                    style={[styles.confidenceDot, { backgroundColor: getConfidenceColor() }]}
                  />
                  <Text style={styles.confidenceText}>
                    {prediction.confidence.toUpperCase()} confidence
                  </Text>
                </View>
              </View>

              {/* Likely Emotions */}
              {prediction.likelyEmotions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Likely Emotions</Text>
                  <View style={styles.tagContainer}>
                    {prediction.likelyEmotions.map((item, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{item.tag}</Text>
                        <Text style={styles.probabilityText}>
                          {Math.round(item.probability * 100)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Likely Sensory Tags */}
              {prediction.likelySensoryTags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Expected Sensory Elements</Text>
                  <View style={styles.tagContainer}>
                    {prediction.likelySensoryTags.map((item, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{item.tag}</Text>
                        <Text style={styles.categoryText}>{item.category}</Text>
                        <Text style={styles.probabilityText}>
                          {Math.round(item.probability * 100)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Alternative Suggestions */}
              {prediction.alternativeSuggestions &&
                prediction.alternativeSuggestions.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alternative Suggestions</Text>
                    {prediction.alternativeSuggestions.map((suggestion, index) => (
                      <View key={index} style={styles.suggestionBox}>
                        <Text style={styles.suggestionText}>{suggestion.reason}</Text>
                      </View>
                    ))}
                  </View>
                )}
            </ScrollView>
          ) : (
            <Text style={styles.error}>Failed to generate prediction</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  predictionBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  predictionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  probabilityText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  suggestionBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  error: {
    textAlign: 'center',
    color: '#FF3B30',
    padding: 20,
  },
});

