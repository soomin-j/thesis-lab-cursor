'use client';

import { useAppStore } from '@/lib/store';
import { Mood } from '@/lib/types';
import { Wind, Umbrella, Zap, CloudRain, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export function MoodSelector() {
  const { currentMood, setMood } = useAppStore();
  
  const moods: { id: Mood; label: string; icon: any; color: string }[] = [
    { id: 'anxious', label: 'Anxious', icon: Wind, color: 'bg-sky-100 text-sky-600 hover:bg-sky-200' },
    { id: 'overwhelmed', label: 'Overwhelmed', icon: Umbrella, color: 'bg-stone-100 text-stone-600 hover:bg-stone-200' },
    { id: 'energetic', label: 'Energetic', icon: Zap, color: 'bg-orange-100 text-orange-600 hover:bg-orange-200' },
    { id: 'melancholic', label: 'Melancholic', icon: CloudRain, color: 'bg-rose-100 text-rose-600 hover:bg-rose-200' },
    { id: 'bored', label: 'Bored', icon: Sparkles, color: 'bg-violet-100 text-violet-600 hover:bg-violet-200' },
  ];

  return (
    <div className="flex flex-col items-center space-y-6 p-6 glass-panel rounded-3xl animate-fade-in w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-center opacity-80">How are you feeling?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
        {moods.map((m) => {
           const Icon = m.icon;
           return (
            <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={clsx(
                "p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform aspect-square",
                m.color,
                currentMood === m.id ? "scale-105 ring-4 ring-white shadow-lg z-10" : "hover:scale-105 opacity-80 hover:opacity-100"
                )}
            >
                <Icon className="w-8 h-8 mb-2" />
                <span className="font-medium text-sm">{m.label}</span>
            </button>
           );
        })}
      </div>
    </div>
  );
}

