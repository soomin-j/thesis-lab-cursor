import React from 'react';
import { SensoryCategory } from './SensoryHeatmapOverlay';
import './SensoryFilterModal.css';

interface SensoryFilterModalProps {
  visible: boolean;
  selectedCategory: SensoryCategory;
  onCategoryChange: (category: SensoryCategory) => void;
  onClose: () => void;
}

export default function SensoryFilterModal({
  visible,
  selectedCategory,
  onCategoryChange,
  onClose,
}: SensoryFilterModalProps) {
  if (!visible) return null;

  const categories: {
    value: SensoryCategory;
    label: string;
    icon: string;
    color: string;
    description: string;
  }[] = [
    { value: 'all', label: 'All', icon: '🌐', color: '#D4C5E0', description: 'Show all sensory elements' },
    { value: 'sound', label: 'Sound', icon: '🔊', color: '#B8D4E3', description: 'Music, noise, silence' },
    { value: 'light', label: 'Light', icon: '💡', color: '#FFE8B4', description: 'Sunlight, dimness, glare' },
    { value: 'smell', label: 'Smell', icon: '👃', color: '#C8DCB4', description: 'Coffee, food, nature' },
    { value: 'space', label: 'Space', icon: '🏞️', color: '#DCC8F0', description: 'Crowded, spacious' },
    { value: 'air', label: 'Air', icon: '🌬️', color: '#FFC8B4', description: 'Warmth, breeze, humidity' },
  ];

  const handleCategorySelect = (category: SensoryCategory) => {
    onCategoryChange(category);
    // Close modal after selection
    setTimeout(() => onClose(), 300);
  };

  const selectedCategoryData = categories.find((cat) => cat.value === selectedCategory);

  return (
    <>
      <div className="sensory-filter-modal-overlay" onClick={onClose} />
      <div className="sensory-filter-modal">
        <div className="sensory-filter-modal-header">
          <h2 className="sensory-filter-modal-title">Filter Sensory Layers</h2>
          <button className="sensory-filter-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="sensory-filter-modal-content">
          <p className="sensory-filter-modal-description">
            Select a sensory category to visualize specific elements on the map
          </p>
          <div className="sensory-filter-modal-grid">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`sensory-filter-modal-option ${
                  selectedCategory === category.value ? 'active' : ''
                }`}
                onClick={() => handleCategorySelect(category.value)}
                style={{
                  borderColor:
                    selectedCategory === category.value ? category.color : 'rgba(212, 197, 224, 0.4)',
                  background:
                    selectedCategory === category.value
                      ? `linear-gradient(135deg, ${category.color}33 0%, ${category.color}22 100%)`
                      : 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <span className="sensory-filter-modal-option-icon">{category.icon}</span>
                <span className="sensory-filter-modal-option-label">{category.label}</span>
                <span className="sensory-filter-modal-option-description">{category.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}




