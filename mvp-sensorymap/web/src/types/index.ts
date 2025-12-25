export interface EmotionTag {
  id: string;
  emoji: string;
  label: string;
  category: 'positive' | 'negative' | 'neutral';
}

export interface SensoryTag {
  id: string;
  emoji: string;
  label: string;
  category: 'sound' | 'light' | 'air' | 'smell' | 'space' | 'taste' | 'touch';
}

export interface LocationPoint {
  id?: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface SensoryLog {
  id?: string;
  user_id?: string;
  location_id?: string;
  timestamp: Date;
  photo_url?: string;
  description?: string;
  emotion_tags: EmotionTag[];
  sensory_tags: SensoryTag[];
  ai_extracted: boolean;
}

export const EMOTION_TAGS: EmotionTag[] = [
  { id: 'relaxed', emoji: '😌', label: 'Relaxed', category: 'positive' },
  { id: 'inspired', emoji: '😍', label: 'Inspired', category: 'positive' },
  { id: 'energized', emoji: '😄', label: 'Energized', category: 'positive' },
  { id: 'calm', emoji: '🧘', label: 'Calm', category: 'positive' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', category: 'negative' },
  { id: 'down', emoji: '😞', label: 'Down', category: 'negative' },
  { id: 'irritated', emoji: '😠', label: 'Irritated', category: 'negative' },
  { id: 'lonely', emoji: '😔', label: 'Lonely', category: 'negative' },
  { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful', category: 'neutral' },
  { id: 'foggy', emoji: '🌫️', label: 'Foggy', category: 'neutral' },
  { id: 'numb', emoji: '😶', label: 'Numb', category: 'neutral' },
];

export const SENSORY_TAGS: SensoryTag[] = [
  { id: 'silence', emoji: '🔇', label: 'Silence', category: 'sound' },
  { id: 'music', emoji: '🎵', label: 'Music', category: 'sound' },
  { id: 'loudness', emoji: '📣', label: 'Loudness', category: 'sound' },
  { id: 'street-noise', emoji: '🚗', label: 'Street Noise', category: 'sound' },
  { id: 'sunlight', emoji: '☀️', label: 'Sunlight', category: 'light' },
  { id: 'dimness', emoji: '🌙', label: 'Dimness', category: 'light' },
  { id: 'warm-light', emoji: '💡', label: 'Warm Light', category: 'light' },
  { id: 'glare', emoji: '✨', label: 'Glare', category: 'light' },
  { id: 'warmth', emoji: '🔥', label: 'Warmth', category: 'air' },
  { id: 'breeze', emoji: '🌬️', label: 'Breeze', category: 'air' },
  { id: 'dryness', emoji: '🏜️', label: 'Dryness', category: 'air' },
  { id: 'humidity', emoji: '💧', label: 'Humidity', category: 'air' },
  { id: 'coffee', emoji: '☕', label: 'Coffee', category: 'smell' },
  { id: 'food', emoji: '🍔', label: 'Food', category: 'smell' },
  { id: 'nature', emoji: '🌿', label: 'Nature', category: 'smell' },
  { id: 'pollution', emoji: '🌫️', label: 'Pollution', category: 'smell' },
  { id: 'crowded', emoji: '👥', label: 'Crowded', category: 'space' },
  { id: 'spacious', emoji: '🏞️', label: 'Spacious', category: 'space' },
  { id: 'familiar', emoji: '🏠', label: 'Familiar', category: 'space' },
  { id: 'closed-in', emoji: '🏢', label: 'Closed-in', category: 'space' },
  { id: 'sweet', emoji: '🍬', label: 'Sweet', category: 'taste' },
  { id: 'bitter', emoji: '🍫', label: 'Bitter', category: 'taste' },
  { id: 'soft', emoji: '🧸', label: 'Soft', category: 'touch' },
  { id: 'rough', emoji: '🧱', label: 'Rough', category: 'touch' },
];

