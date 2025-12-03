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
  location: {
    lat: number;
    lng: number;
  };
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
      if (USE_MOCK_DATA) {
        const data = await MockDataService.getSensorySummary(
          location.latitude,
          location.longitude
        );
        setSummary(data);
      } else {
        // const response = await api.get(
        //   `/locations/${location.latitude}/${location.longitude}/sensory-summary`
        // );
        // setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !location) {
    return null;
  }

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
            <Text style={styles.title}>Sensory Summary</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : summary ? (
            <ScrollView style={styles.content}>
              <Text style={styles.subtitle}>
                Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
              </Text>

              {/* Top Emotions */}
              {summary.topEmotions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Top Emotions</Text>
                  {summary.topEmotions.map((item, index) => (
                    <View key={index} style={styles.tagRow}>
                      <Text style={styles.tagEmoji}>{item.tag.emoji}</Text>
                      <Text style={styles.tagLabel}>{item.tag.label}</Text>
                      <View style={styles.percentageBar}>
                        <View
                          style={[
                            styles.percentageFill,
                            { width: `${item.percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.percentageText}>{item.percentage}%</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Top Sensory Tags */}
              {summary.topSensoryTags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sensory Elements</Text>
                  {summary.topSensoryTags.map((item, index) => (
                    <View key={index} style={styles.tagRow}>
                      <Text style={styles.tagEmoji}>{item.tag.emoji}</Text>
                      <Text style={styles.tagLabel}>{item.tag.label}</Text>
                      <View style={styles.percentageBar}>
                        <View
                          style={[
                            styles.percentageFill,
                            { width: `${item.percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.percentageText}>{item.percentage}%</Text>
                    </View>
                  ))}
                </View>
              )}

              {summary.totalReviews === 0 && (
                <Text style={styles.noData}>
                  No reviews available for this location yet.
                </Text>
              )}
            </ScrollView>
          ) : (
            <Text style={styles.error}>Failed to load summary</Text>
          )}

          {onRequestPrediction && (
            <TouchableOpacity style={styles.predictionButton} onPress={onRequestPrediction}>
              <Text style={styles.predictionButtonText}>How Might It Feel?</Text>
            </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tagLabel: {
    flex: 1,
    fontSize: 16,
  },
  percentageBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  error: {
    textAlign: 'center',
    color: '#FF3B30',
    padding: 20,
  },
  predictionButton: {
    backgroundColor: '#34C759',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  predictionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

