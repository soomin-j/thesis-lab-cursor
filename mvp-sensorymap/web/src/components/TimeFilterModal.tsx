import React from 'react';
import { TimeFilter } from './TimeFilter';
import './TimeFilterModal.css';

interface TimeFilterModalProps {
  visible: boolean;
  selectedTime: TimeFilter;
  onTimeChange: (time: TimeFilter) => void;
  onClose: () => void;
}

export default function TimeFilterModal({
  visible,
  selectedTime,
  onTimeChange,
  onClose,
}: TimeFilterModalProps) {
  if (!visible) return null;

  const timeOptions: { value: TimeFilter; label: string; icon: string; description: string }[] = [
    { value: 'all', label: 'All Time', icon: '🕐', description: 'Show all sensory experiences' },
    { value: 'morning', label: 'Morning', icon: '🌅', description: '6 AM - 12 PM' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️', description: '12 PM - 6 PM' },
    { value: 'evening', label: 'Evening', icon: '🌆', description: '6 PM - 10 PM' },
    { value: 'night', label: 'Night', icon: '🌙', description: '10 PM - 6 AM' },
    { value: 'current', label: 'Now', icon: '✨', description: 'Current time period' },
  ];

  const handleTimeSelect = (time: TimeFilter) => {
    onTimeChange(time);
    // Close modal after selection
    setTimeout(() => onClose(), 300);
  };

  return (
    <>
      <div className="time-filter-modal-overlay" onClick={onClose} />
      <div className="time-filter-modal">
        <div className="time-filter-modal-header">
          <h2 className="time-filter-modal-title">Filter by Time</h2>
          <button className="time-filter-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="time-filter-modal-content">
          <p className="time-filter-modal-description">
            Select a time period to see how feelings change throughout the day
          </p>
          <div className="time-filter-modal-grid">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                className={`time-filter-modal-option ${selectedTime === option.value ? 'active' : ''}`}
                onClick={() => handleTimeSelect(option.value)}
              >
                <span className="time-filter-modal-option-icon">{option.icon}</span>
                <span className="time-filter-modal-option-label">{option.label}</span>
                <span className="time-filter-modal-option-description">{option.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}




