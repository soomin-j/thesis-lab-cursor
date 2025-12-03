import React from 'react';
import './TimeFilter.css';

export type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening' | 'night' | 'current';

interface TimeFilterProps {
  selectedTime: TimeFilter;
  onTimeChange: (time: TimeFilter) => void;
}

export default function TimeFilter({ selectedTime, onTimeChange }: TimeFilterProps) {
  const timeOptions: { value: TimeFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All Time', icon: '🕐' },
    { value: 'morning', label: 'Morning', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
    { value: 'evening', label: 'Evening', icon: '🌆' },
    { value: 'night', label: 'Night', icon: '🌙' },
    { value: 'current', label: 'Now', icon: '✨' },
  ];

  return (
    <div className="time-filter-container">
      <div className="time-filter-label">Time</div>
      <div className="time-filter-buttons">
        {timeOptions.map((option) => (
          <button
            key={option.value}
            className={`time-filter-button ${selectedTime === option.value ? 'active' : ''}`}
            onClick={() => onTimeChange(option.value)}
            title={option.label}
          >
            <span className="time-filter-icon">{option.icon}</span>
            <span className="time-filter-text">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

