import OpenAI from 'openai';
import { getSensorySummary } from './aggregationService';
import { SensoryLogModel } from '../models/SensoryLog';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PredictionRequest {
  latitude: number;
  longitude: number;
  userId: string;
  userPreferences?: {
    preferredEmotions?: string[];
    avoidedSensoryTags?: string[];
  };
}

export interface PredictionResponse {
  prediction: string;
  confidence: 'high' | 'medium' | 'low';
  likelyEmotions: Array<{ tag: string; probability: number }>;
  likelySensoryTags: Array<{ tag: string; category: string; probability: number }>;
  alternativeSuggestions?: Array<{
    location: { lat: number; lng: number };
    reason: string;
  }>;
}

export async function predictSensoryExperience(
  request: PredictionRequest
): Promise<PredictionResponse> {
  try {
    // Get aggregated summary for the location
    const summary = await getSensorySummary(request.latitude, request.longitude);

    // Get user's historical logs at similar locations
    const userLogs = await SensoryLogModel.findByLocationRadius(
      request.latitude,
      request.longitude,
      0.002 // Slightly larger radius for user history
    );
    const userLogsAtLocation = userLogs.filter((log) => log.user_id === request.userId);

    // Get current time context
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Build context for AI
    const context = {
      location: {
        lat: request.latitude,
        lng: request.longitude,
      },
      time: {
        hour,
        dayOfWeek,
        isWeekend,
        timeOfDay: getTimeOfDay(hour),
      },
      aggregatedData: {
        totalReviews: summary.totalReviews,
        topEmotions: summary.topEmotions.slice(0, 3),
        topSensoryTags: summary.topSensoryTags.slice(0, 5),
      },
      userHistory: userLogsAtLocation.length > 0 ? {
        previousVisits: userLogsAtLocation.length,
        commonEmotions: getMostCommonTags(userLogsAtLocation, 'emotion'),
        commonSensoryTags: getMostCommonTags(userLogsAtLocation, 'sensory'),
      } : null,
      userPreferences: request.userPreferences,
    };

    // Generate prediction using OpenAI
    const prompt = buildPredictionPrompt(context);
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that predicts sensory experiences in urban environments for people with sensory sensitivities. 
          Provide empathetic, accurate predictions based on location data, time patterns, and user history.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const predictionText = response.choices[0]?.message?.content || '';

    // Parse structured data from response
    const likelyEmotions = summary.topEmotions.slice(0, 3).map((item) => ({
      tag: item.tag.label,
      probability: item.percentage / 100,
    }));

    const likelySensoryTags = summary.topSensoryTags.slice(0, 5).map((item) => ({
      tag: item.tag.label,
      category: item.tag.category,
      probability: item.percentage / 100,
    }));

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (summary.totalReviews > 20) {
      confidence = 'high';
    } else if (summary.totalReviews < 5) {
      confidence = 'low';
    }

    // Check if location might be unsuitable based on user preferences
    const alternativeSuggestions = generateAlternativeSuggestions(
      context,
      request.userPreferences
    );

    return {
      prediction: predictionText,
      confidence,
      likelyEmotions,
      likelySensoryTags,
      alternativeSuggestions: alternativeSuggestions.length > 0 ? alternativeSuggestions : undefined,
    };
  } catch (error: any) {
    console.error('Error generating prediction:', error);
    throw new Error('Failed to generate prediction');
  }
}

function buildPredictionPrompt(context: any): string {
  let prompt = `Predict the sensory experience at this location:\n\n`;
  prompt += `Location: ${context.location.lat}, ${context.location.lng}\n`;
  prompt += `Time: ${context.time.timeOfDay} (${context.time.hour}:00), ${context.time.isWeekend ? 'Weekend' : 'Weekday'}\n\n`;

  if (context.aggregatedData.totalReviews > 0) {
    prompt += `Based on ${context.aggregatedData.totalReviews} reviews:\n`;
    prompt += `Top emotions: ${context.aggregatedData.topEmotions.map((e: any) => `${e.tag.label} (${e.percentage}%)`).join(', ')}\n`;
    prompt += `Top sensory tags: ${context.aggregatedData.topSensoryTags.map((s: any) => `${s.tag.label} (${s.tag.category}, ${s.percentage}%)`).join(', ')}\n\n`;
  } else {
    prompt += `No reviews available for this location yet.\n\n`;
  }

  if (context.userHistory) {
    prompt += `User has visited this area ${context.userHistory.previousVisits} time(s) before.\n`;
    if (context.userHistory.commonEmotions.length > 0) {
      prompt += `Their common emotions here: ${context.userHistory.commonEmotions.join(', ')}\n`;
    }
  }

  if (context.userPreferences) {
    if (context.userPreferences.preferredEmotions) {
      prompt += `User prefers: ${context.userPreferences.preferredEmotions.join(', ')}\n`;
    }
    if (context.userPreferences.avoidedSensoryTags) {
      prompt += `User avoids: ${context.userPreferences.avoidedSensoryTags.join(', ')}\n`;
    }
  }

  prompt += `\nProvide a brief, empathetic prediction (2-3 sentences) of what the sensory experience might be like at this location right now. `;
  prompt += `Consider time of day patterns, typical crowd levels, and sensory characteristics. `;
  prompt += `If the location might be overwhelming based on user preferences, mention that.`;

  return prompt;
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

function getMostCommonTags(logs: any[], type: 'emotion' | 'sensory'): string[] {
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    const tags = type === 'emotion' ? log.emotion_tags : log.sensory_tags;
    tags?.forEach((tag: any) => {
      counts[tag.label] = (counts[tag.label] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);
}

function generateAlternativeSuggestions(
  context: any,
  preferences?: { avoidedSensoryTags?: string[] }
): Array<{ location: { lat: number; lng: number }; reason: string }> {
  const suggestions: Array<{ location: { lat: number; lng: number }; reason: string }> = [];

  // Check if location has tags user wants to avoid
  if (preferences?.avoidedSensoryTags && context.aggregatedData.topSensoryTags) {
    const hasAvoidedTags = context.aggregatedData.topSensoryTags.some((tag: any) =>
      preferences.avoidedSensoryTags?.includes(tag.tag.label)
    );

    if (hasAvoidedTags) {
      // Suggest nearby quieter areas (simplified - in production, use actual location search)
      suggestions.push({
        location: {
          lat: context.location.lat + 0.001,
          lng: context.location.lng + 0.001,
        },
        reason: 'Nearby park area might be quieter',
      });
    }
  }

  return suggestions;
}

