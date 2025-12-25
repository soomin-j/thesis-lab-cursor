'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function MoodListener() {
  const { currentMood } = useAppStore();

  useEffect(() => {
    document.body.setAttribute('data-mood', currentMood);
  }, [currentMood]);

  return null;
}

