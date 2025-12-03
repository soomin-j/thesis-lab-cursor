import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmotionTag } from '../types';

interface EmotionPinProps {
  emotion: EmotionTag;
  size?: number;
}

export default function EmotionPin({ emotion, size = 40 }: EmotionPinProps) {
  const getColor = () => {
    switch (emotion.category) {
      case 'positive':
        return '#34C759'; // Green
      case 'negative':
        return '#FF3B30'; // Red
      case 'neutral':
        return '#8E8E93'; // Gray
      default:
        return '#007AFF'; // Blue
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getColor(),
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emotion.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: {
    textAlign: 'center',
  },
});

