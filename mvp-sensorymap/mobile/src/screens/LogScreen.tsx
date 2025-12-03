import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import TagSelector from '../components/TagSelector';
import LocationService from '../services/LocationService';
import api from '../services/AIService';
import { EmotionTag, SensoryTag } from '../types';
import { useAuth } from '../store/AuthContext';

export default function LogScreen({ navigation }: any) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedEmotionTags, setSelectedEmotionTags] = useState<EmotionTag[]>([]);
  const [selectedSensoryTags, setSelectedSensoryTags] = useState<SensoryTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractingTags, setExtractingTags] = useState(false);

  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          setPhoto(response.assets[0].uri || null);
        }
      }
    );
  };

  const handlePickPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          setPhoto(response.assets[0].uri || null);
        }
      }
    );
  };

  const handleExtractTags = async () => {
    if (!photo && !description) {
      Alert.alert('Error', 'Please add a photo or description to extract tags');
      return;
    }

    setExtractingTags(true);
    try {
      const extractedTags = await api.extractTags(photo, description);
      if (extractedTags.emotionTags) {
        setSelectedEmotionTags(extractedTags.emotionTags);
      }
      if (extractedTags.sensoryTags) {
        setSelectedSensoryTags(extractedTags.sensoryTags);
      }
      Alert.alert('Success', 'Tags extracted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to extract tags');
    } finally {
      setExtractingTags(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedEmotionTags.length === 0 && selectedSensoryTags.length === 0) {
      Alert.alert('Error', 'Please select at least one tag');
      return;
    }

    setLoading(true);
    try {
      // Get current location
      const location = await LocationService.getCurrentLocation();

      // Create form data for photo upload
      const formData = new FormData();
      if (photo) {
        formData.append('photo', {
          uri: photo,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);
      }
      formData.append('description', description);
      formData.append('emotionTags', JSON.stringify(selectedEmotionTags));
      formData.append('sensoryTags', JSON.stringify(selectedSensoryTags));
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());

      await api.createSensoryLog(formData);
      
      // Refresh the logs list (in a real app, this would trigger a refresh)
      // For now, the mock data service handles this internally

      Alert.alert('Success', 'Sensory log created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setDescription('');
            setPhoto(null);
            setSelectedEmotionTags([]);
            setSelectedSensoryTags([]);
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create sensory log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Log Your Sensory Experience</Text>

      {/* Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo (Optional)</Text>
        {photo ? (
          <View>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setPhoto(null)}
            >
              <Text style={styles.removeButtonText}>Remove Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
              <Text style={styles.photoButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description (Optional)</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Describe your sensory experience..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* AI Extract Tags Button */}
      {(photo || description) && (
        <TouchableOpacity
          style={styles.extractButton}
          onPress={handleExtractTags}
          disabled={extractingTags}
        >
          {extractingTags ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.extractButtonText}>Extract Tags with AI</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Tag Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Tags</Text>
        <TagSelector
          selectedEmotionTags={selectedEmotionTags}
          selectedSensoryTags={selectedSensoryTags}
          onEmotionTagsChange={setSelectedEmotionTags}
          onSensoryTagsChange={setSelectedSensoryTags}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Save Log</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  extractButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  extractButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

