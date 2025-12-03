import React, { useState } from 'react';
import { EmotionTag, SensoryTag, EMOTION_TAGS, SENSORY_TAGS } from '../types';
import './TagSelector.css';

interface TagSelectorProps {
  selectedEmotionTags: EmotionTag[];
  selectedSensoryTags: SensoryTag[];
  onEmotionTagsChange: (tags: EmotionTag[]) => void;
  onSensoryTagsChange: (tags: SensoryTag[]) => void;
}

export default function TagSelector({
  selectedEmotionTags,
  selectedSensoryTags,
  onEmotionTagsChange,
  onSensoryTagsChange,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const toggleEmotionTag = (tag: EmotionTag) => {
    const isSelected = selectedEmotionTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onEmotionTagsChange(selectedEmotionTags.filter((t) => t.id !== tag.id));
    } else {
      onEmotionTagsChange([...selectedEmotionTags, tag]);
    }
  };

  const toggleSensoryTag = (tag: SensoryTag) => {
    const isSelected = selectedSensoryTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onSensoryTagsChange(selectedSensoryTags.filter((t) => t.id !== tag.id));
    } else {
      onSensoryTagsChange([...selectedSensoryTags, tag]);
    }
  };

  const filteredEmotionTags = EMOTION_TAGS.filter(
    (tag) =>
      tag.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.emoji.includes(searchQuery)
  );

  const filteredSensoryTags = SENSORY_TAGS.filter(
    (tag) =>
      tag.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.emoji.includes(searchQuery)
  );

  return (
    <div className="tag-selector">
      <input
        type="text"
        className="search-input"
        placeholder="Search tags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="tag-sections">
        {/* Emotion Tags */}
        <div className="tag-section">
          <h3 className="section-title">Emotions</h3>
          <div className="tag-container">
            {filteredEmotionTags.map((tag) => {
              const isSelected = selectedEmotionTags.some((t) => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleEmotionTag(tag)}
                >
                  <span className="tag-emoji">{tag.emoji}</span>
                  <span className="tag-label">{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sensory Tags */}
        <div className="tag-section">
          <h3 className="section-title">Sensory</h3>
          <div className="tag-container">
            {filteredSensoryTags.map((tag) => {
              const isSelected = selectedSensoryTags.some((t) => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSensoryTag(tag)}
                >
                  <span className="tag-emoji">{tag.emoji}</span>
                  <span className="tag-label">{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

