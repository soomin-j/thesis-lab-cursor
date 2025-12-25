import { create } from 'zustand';
import { Mood } from './types';

interface AppState {
  currentMood: Mood;
  setMood: (mood: Mood) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentMood: 'neutral',
  setMood: (mood) => set({ currentMood: mood }),
}));

