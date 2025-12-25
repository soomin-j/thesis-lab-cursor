export type Mood = 'anxious' | 'overwhelmed' | 'energetic' | 'melancholic' | 'bored' | 'neutral';

export interface SensoryProfile {
  sound: 'quiet' | 'moderate' | 'loud';
  light: 'dim' | 'natural' | 'bright' | 'neon';
  crowd: 'empty' | 'sparse' | 'moderate' | 'crowded';
  vibe: string[]; // e.g. "zen", "cozy", "industrial"
}

export interface Location {
  id: string;
  name: string;
  position: [number, number]; // [lat, lng]
  sensory: SensoryProfile;
  category: 'park' | 'cafe' | 'library' | 'street' | 'plaza';
  description: string;
}

