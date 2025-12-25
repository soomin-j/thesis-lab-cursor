import React from 'react';
import { SensoryCategory } from './SensoryHeatmapOverlay';
import './SensoryLayerControls.css';

interface SensoryLayerControlsProps {
  selectedCategory: SensoryCategory;
  onCategoryChange: (category: SensoryCategory) => void;
  visible: boolean;
}

export default function SensoryLayerControls({
  selectedCategory,
  onCategoryChange,
  visible,
}: SensoryLayerControlsProps) {
  if (!visible) return null;

  const categories: { value: SensoryCategory; label: string; icon: string; color: string }[] = [
    { value: 'all', label: 'All', icon: '🌐', color: '#D4C5E0' },
    { value: 'sound', label: 'Sound', icon: '🔊', color: '#B8D4E3' },
    { value: 'light', label: 'Light', icon: '💡', color: '#FFE8B4' },
    { value: 'smell', label: 'Smell', icon: '👃', color: '#C8DCB4' },
    { value: 'space', label: 'Space', icon: '🏞️', color: '#DCC8F0' },
    { value: 'air', label: 'Air', icon: '🌬️', color: '#FFC8B4' },
  ];

  return (
    <div className="sensory-layer-controls">
      <div className="sensory-controls-label">Sensory Layers</div>
      <div className="sensory-controls-buttons">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`sensory-control-button ${selectedCategory === cat.value ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.value)}
            style={{
              borderColor: selectedCategory === cat.value ? cat.color : 'rgba(212, 197, 224, 0.4)',
              background: selectedCategory === cat.value
                ? `linear-gradient(135deg, ${cat.color}33 0%, ${cat.color}22 100%)`
                : 'rgba(255, 255, 255, 0.95)',
            }}
            title={cat.label}
          >
            <span className="sensory-control-icon">{cat.icon}</span>
            <span className="sensory-control-text">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


