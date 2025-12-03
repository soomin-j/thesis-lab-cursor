import { LocationPoint, SensoryLog, EmotionTag, SensoryTag } from '../types';

// Mock user
export const MOCK_USER = {
  id: 'mock-user-1',
  email: 'demo@sensescape.com',
};

// Mock location points (San Francisco area)
export const MOCK_LOCATION_POINTS: LocationPoint[] = [
  {
    id: 'loc-1',
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    accuracy: 10,
  },
  {
    id: 'loc-2',
    latitude: 37.7849,
    longitude: -122.4094,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    accuracy: 15,
  },
  {
    id: 'loc-3',
    latitude: 37.7949,
    longitude: -122.3994,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    accuracy: 12,
  },
];

// Mock sensory logs
export const MOCK_SENSORY_LOGS: SensoryLog[] = [
  {
    id: 'log-1',
    user_id: MOCK_USER.id,
    location_id: 'loc-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Busy street with lots of traffic noise',
    emotion_tags: [
      { id: 'anxious', emoji: '😰', label: 'Anxious', category: 'negative' },
    ],
    sensory_tags: [
      { id: 'loudness', emoji: '📣', label: 'Loudness', category: 'sound' },
      { id: 'street-noise', emoji: '🚗', label: 'Street Noise', category: 'sound' },
      { id: 'crowded', emoji: '👥', label: 'Crowded', category: 'space' },
    ],
    ai_extracted: false,
  },
  {
    id: 'log-2',
    user_id: MOCK_USER.id,
    location_id: 'loc-2',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    description: 'Quiet park area, very peaceful',
    emotion_tags: [
      { id: 'calm', emoji: '🧘', label: 'Calm', category: 'positive' },
      { id: 'relaxed', emoji: '😌', label: 'Relaxed', category: 'positive' },
    ],
    sensory_tags: [
      { id: 'silence', emoji: '🔇', label: 'Silence', category: 'sound' },
      { id: 'nature', emoji: '🌿', label: 'Nature', category: 'smell' },
      { id: 'spacious', emoji: '🏞️', label: 'Spacious', category: 'space' },
    ],
    ai_extracted: true,
  },
];

// Mock sensory summary
export const MOCK_SENSORY_SUMMARY = {
  location: { lat: 37.7749, lng: -122.4194 },
  radius: 0.001,
  totalReviews: 15,
  topEmotions: [
    {
      tag: { id: 'anxious', emoji: '😰', label: 'Anxious', category: 'negative' },
      percentage: 45,
      count: 7,
    },
    {
      tag: { id: 'calm', emoji: '🧘', label: 'Calm', category: 'positive' },
      percentage: 30,
      count: 5,
    },
    {
      tag: { id: 'energized', emoji: '😄', label: 'Energized', category: 'positive' },
      percentage: 25,
      count: 3,
    },
  ],
  topSensoryTags: [
    {
      tag: { id: 'loudness', emoji: '📣', label: 'Loudness', category: 'sound' },
      percentage: 63,
      count: 10,
    },
    {
      tag: { id: 'bright', emoji: '☀️', label: 'Bright', category: 'light' },
      percentage: 51,
      count: 8,
    },
    {
      tag: { id: 'crowded', emoji: '👥', label: 'Crowded', category: 'space' },
      percentage: 40,
      count: 6,
    },
  ],
  lastUpdated: new Date(),
};

// Mock prediction
export const MOCK_PREDICTION = {
  prediction:
    'This area is likely to be crowded and noisy at this hour. Based on historical data, you might experience loud street noise and bright sunlight. If you prefer something quiet, you might enjoy the nearby park instead.',
  confidence: 'high' as const,
  likelyEmotions: [
    { tag: 'Anxious', probability: 0.45 },
    { tag: 'Energized', probability: 0.30 },
  ],
  likelySensoryTags: [
    { tag: 'Loudness', category: 'sound', probability: 0.63 },
    { tag: 'Bright', category: 'light', probability: 0.51 },
    { tag: 'Crowded', category: 'space', probability: 0.40 },
  ],
  alternativeSuggestions: [
    {
      location: { lat: 37.7849, lng: -122.4094 },
      reason: 'Nearby park area might be quieter',
    },
  ],
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockDataService {
  static async login(email: string, password: string) {
    await delay(500);
    return {
      user: MOCK_USER,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    };
  }

  static async register(email: string, password: string) {
    await delay(500);
    return {
      user: MOCK_USER,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    };
  }

  static async getLocationHistory(userId: string) {
    await delay(300);
    return MOCK_LOCATION_POINTS;
  }

  static async getSensoryLogs(userId: string) {
    await delay(300);
    return MOCK_SENSORY_LOGS;
  }

  static async getDailyLogs(userId: string, date: string) {
    await delay(300);
    return MOCK_SENSORY_LOGS.filter((log) => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      return logDate === date;
    });
  }

  static async getSensorySummary(lat: number, lng: number) {
    await delay(400);
    return MOCK_SENSORY_SUMMARY;
  }

  static async getPrediction(lat: number, lng: number) {
    await delay(800);
    return MOCK_PREDICTION;
  }

  static async extractTags(photoUri?: string | null, description?: string) {
    await delay(1000);
    return {
      emotionTags: [
        { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful', category: 'neutral' },
      ],
      sensoryTags: [
        { id: 'music', emoji: '🎵', label: 'Music', category: 'sound' },
        { id: 'warm-light', emoji: '💡', label: 'Warm Light', category: 'light' },
      ],
    };
  }

  static async createSensoryLog(data: any) {
    await delay(500);
    const newLog: SensoryLog = {
      id: `log-${Date.now()}`,
      user_id: MOCK_USER.id,
      location_id: 'loc-1',
      timestamp: new Date(),
      description: data.description,
      emotion_tags: JSON.parse(data.emotionTags || '[]'),
      sensory_tags: JSON.parse(data.sensoryTags || '[]'),
      ai_extracted: false,
    };
    MOCK_SENSORY_LOGS.unshift(newLog);
    return newLog;
  }
}

