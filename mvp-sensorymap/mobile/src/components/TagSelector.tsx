import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { EmotionTag, SensoryTag, EMOTION_TAGS, SENSORY_TAGS } from '../types';

interface TagSelectorProps {
  selectedEmotionTags: EmotionTag[];
  selectedSensoryTags: SensoryTag[];
  onEmotionTagsChange: (tags: EmotionTag[]) => void;
  onSensoryTagsChange: (tags: SensoryTag[]) => void;
}

export default function TagSelector({
  selectedEmotionTags,
  selectedSensoryTags,
  onEmotionTagsChange,
  onSensoryTagsChange,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const toggleEmotionTag = (tag: EmotionTag) => {
    const isSelected = selectedEmotionTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onEmotionTagsChange(selectedEmotionTags.filter((t) => t.id !== tag.id));
    } else {
      onEmotionTagsChange([...selectedEmotionTags, tag]);
    }
  };

  const toggleSensoryTag = (tag: SensoryTag) => {
    const isSelected = selectedSensoryTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onSensoryTagsChange(selectedSensoryTags.filter((t) => t.id !== tag.id));
    } else {
      onSensoryTagsChange([...selectedSensoryTags, tag]);
    }
  };

  const filteredEmotionTags = EMOTION_TAGS.filter(
    (tag) =>
      tag.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.emoji.includes(searchQuery)
  );

  const filteredSensoryTags = SENSORY_TAGS.filter(
    (tag) =>
      tag.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.emoji.includes(searchQuery)
  );

  const renderTag = (
    tag: EmotionTag | SensoryTag,
    isSelected: boolean,
    onPress: () => void
  ) => {
    return (
      <TouchableOpacity
        key={tag.id}
        style={[styles.tag, isSelected && styles.tagSelected]}
        onPress={onPress}
      >
        <Text style={styles.tagEmoji}>{tag.emoji}</Text>
        <Text style={[styles.tagLabel, isSelected && styles.tagLabelSelected]}>
          {tag.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search tags..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView style={styles.scrollView}>
        {/* Emotion Tags */}
        <Text style={styles.sectionTitle}>Emotions</Text>
        <View style={styles.tagContainer}>
          {filteredEmotionTags.map((tag) => {
            const isSelected = selectedEmotionTags.some((t) => t.id === tag.id);
            return renderTag(tag, isSelected, () => toggleEmotionTag(tag));
          })}
        </View>

        {/* Sensory Tags */}
        <Text style={styles.sectionTitle}>Sensory</Text>
        <View style={styles.tagContainer}>
          {filteredSensoryTags.map((tag) => {
            const isSelected = selectedSensoryTags.some((t) => t.id === tag.id);
            return renderTag(tag, isSelected, () => toggleSensoryTag(tag));
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tagSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagEmoji: {
    fontSize: 20,
    marginRight: 4,
  },
  tagLabel: {
    fontSize: 14,
    color: '#333',
  },
  tagLabelSelected: {
    color: '#fff',
  },
});

