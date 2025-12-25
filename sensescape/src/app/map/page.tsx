'use client';
import dynamic from 'next/dynamic';
import { MoodSelector } from '@/components/Mood/MoodSelector';
import { useState } from 'react';
import { Settings2, X } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

const MapView = dynamic(() => import('@/components/Map/MapView'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function MapPage() {
  const [showMoods, setShowMoods] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden p-2 md:p-6 bg-slate-50 transition-colors duration-500">
      {/* Header / Nav */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none flex gap-4">
        <Link href="/" className="pointer-events-auto">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 drop-shadow-sm bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full hover:scale-105 transition-transform shadow-sm border border-slate-100">Sensescape</h1>
        </Link>
      </div>

      {/* Map Container */}
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 relative z-10">
        <MapView />
      </div>

      {/* Floating Mood Toggle */}
      <button 
        onClick={() => setShowMoods(!showMoods)}
        className="absolute bottom-8 right-8 z-30 p-4 bg-slate-900 text-white rounded-full shadow-xl hover:scale-110 transition-transform hover:shadow-2xl border border-slate-700/50"
      >
        {showMoods ? <X className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
      </button>

      {/* Mood Selector Overlay */}
      <div className={clsx(
        "absolute bottom-24 right-4 md:right-8 z-30 transition-all duration-300 transform origin-bottom-right w-[90vw] md:w-auto",
        showMoods ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none translate-y-4"
      )}>
        <div className="bg-white/90 backdrop-blur-xl p-1 rounded-3xl shadow-2xl border border-white/50">
            <MoodSelector />
        </div>
      </div>
    </div>
  );
}

