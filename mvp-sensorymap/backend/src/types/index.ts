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
  category: 'sound' | 'light' | 'air' | 'smell' | 'space';
}

