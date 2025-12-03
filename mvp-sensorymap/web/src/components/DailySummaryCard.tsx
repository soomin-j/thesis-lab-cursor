import React from 'react';
import './DailySummaryCard.css';

interface DailySummary {
  date: Date;
  totalDistance: number;
  totalLogs: number;
  mostCommonEmotions: Array<{ tag: any; count: number }>;
  sensoryPatterns: Array<{ category: string; tags: Array<{ tag: any; count: number }> }>;
  timeInZones: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface DailySummaryCardProps {
  summary: DailySummary;
}

export default function DailySummaryCard({ summary }: DailySummaryCardProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="summary-card">
      <h2 className="summary-date">
        {summary.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </h2>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-value">{summary.totalLogs}</div>
          <div className="stat-label">Logs</div>
        </div>
        <div className="stat">
          <div className="stat-value">{formatDistance(summary.totalDistance)}</div>
          <div className="stat-label">Distance</div>
        </div>
      </div>

      {summary.mostCommonEmotions.length > 0 && (
        <div className="summary-section">
          <h3 className="section-title">Top Emotions</h3>
          <div className="tag-row">
            {summary.mostCommonEmotions.slice(0, 3).map((item) => (
              <div key={item.tag.id} className="emotion-tag">
                <span className="emotion-emoji">{item.tag.emoji}</span>
                <span className="emotion-label">{item.tag.label}</span>
                <span className="emotion-count">{item.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="summary-section">
        <h3 className="section-title">Time in Zones</h3>
        <div className="zone-row">
          <div className="zone zone-positive">
            <div className="zone-label">Positive</div>
            <div className="zone-value">{formatTime(summary.timeInZones.positive)}</div>
          </div>
          <div className="zone zone-neutral">
            <div className="zone-label">Neutral</div>
            <div className="zone-value">{formatTime(summary.timeInZones.neutral)}</div>
          </div>
          <div className="zone zone-negative">
            <div className="zone-label">Negative</div>
            <div className="zone-value">{formatTime(summary.timeInZones.negative)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

