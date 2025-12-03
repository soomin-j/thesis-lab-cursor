import OpenAI from 'openai';
import fs from 'fs';
import { EmotionTag, SensoryTag } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMOTION_TAGS = [
  { id: 'relaxed', emoji: '😌', label: 'Relaxed', category: 'positive' },
  { id: 'inspired', emoji: '😍', label: 'Inspired', category: 'positive' },
  { id: 'energized', emoji: '😄', label: 'Energized', category: 'positive' },
  { id: 'calm', emoji: '🧘', label: 'Calm', category: 'positive' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', category: 'negative' },
  { id: 'down', emoji: '😞', label: 'Down', category: 'negative' },
  { id: 'irritated', emoji: '😠', label: 'Irritated', category: 'negative' },
  { id: 'lonely', emoji: '😔', label: 'Lonely', category: 'negative' },
  { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful', category: 'neutral' },
  { id: 'foggy', emoji: '🌫️', label: 'Foggy', category: 'neutral' },
  { id: 'numb', emoji: '😶', label: 'Numb', category: 'neutral' },
];

const SENSORY_TAGS = [
  { id: 'silence', emoji: '🔇', label: 'Silence', category: 'sound' },
  { id: 'music', emoji: '🎵', label: 'Music', category: 'sound' },
  { id: 'loudness', emoji: '📣', label: 'Loudness', category: 'sound' },
  { id: 'street-noise', emoji: '🚗', label: 'Street Noise', category: 'sound' },
  { id: 'sunlight', emoji: '☀️', label: 'Sunlight', category: 'light' },
  { id: 'dimness', emoji: '🌙', label: 'Dimness', category: 'light' },
  { id: 'warm-light', emoji: '💡', label: 'Warm Light', category: 'light' },
  { id: 'glare', emoji: '✨', label: 'Glare', category: 'light' },
  { id: 'warmth', emoji: '🔥', label: 'Warmth', category: 'air' },
  { id: 'breeze', emoji: '🌬️', label: 'Breeze', category: 'air' },
  { id: 'dryness', emoji: '🏜️', label: 'Dryness', category: 'air' },
  { id: 'humidity', emoji: '💧', label: 'Humidity', category: 'air' },
  { id: 'coffee', emoji: '☕', label: 'Coffee', category: 'smell' },
  { id: 'food', emoji: '🍔', label: 'Food', category: 'smell' },
  { id: 'nature', emoji: '🌿', label: 'Nature', category: 'smell' },
  { id: 'pollution', emoji: '🌫️', label: 'Pollution', category: 'smell' },
  { id: 'crowded', emoji: '👥', label: 'Crowded', category: 'space' },
  { id: 'spacious', emoji: '🏞️', label: 'Spacious', category: 'space' },
  { id: 'familiar', emoji: '🏠', label: 'Familiar', category: 'space' },
  { id: 'closed-in', emoji: '🏢', label: 'Closed-in', category: 'space' },
];

export async function extractTagsFromPhoto(photoPath: string): Promise<{
  emotionTags: EmotionTag[];
  sensoryTags: SensoryTag[];
}> {
  try {
    const imageBuffer = fs.readFileSync(photoPath);
    const base64Image = imageBuffer.toString('base64');

    const prompt = `Analyze this urban environment photo and extract:
1. Emotion tags (select 1-3 from: ${EMOTION_TAGS.map(t => t.label).join(', ')})
2. Sensory tags (select 2-5 from: ${SENSORY_TAGS.map(t => t.label).join(', ')})

Return a JSON object with:
{
  "emotionTags": [{"id": "tag_id", "emoji": "emoji", "label": "Label", "category": "positive|negative|neutral"}],
  "sensoryTags": [{"id": "tag_id", "emoji": "emoji", "label": "Label", "category": "sound|light|air|smell|space"}]
}

Only use the exact tag IDs and labels from the provided lists.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Map to our tag structure
    const emotionTags: EmotionTag[] = (parsed.emotionTags || []).map((tag: any) => {
      const found = EMOTION_TAGS.find((t) => t.id === tag.id);
      return found || tag;
    });

    const sensoryTags: SensoryTag[] = (parsed.sensoryTags || []).map((tag: any) => {
      const found = SENSORY_TAGS.find((t) => t.id === tag.id);
      return found || tag;
    });

    return { emotionTags, sensoryTags };
  } catch (error: any) {
    console.error('Error extracting tags from photo:', error);
    throw new Error('Failed to extract tags from photo');
  }
}

export async function extractTagsFromDescription(description: string): Promise<{
  emotionTags: EmotionTag[];
  sensoryTags: SensoryTag[];
}> {
  try {
    const prompt = `Analyze this sensory experience description and extract:
1. Emotion tags (select 1-3 from: ${EMOTION_TAGS.map(t => `${t.label} (${t.id})`).join(', ')})
2. Sensory tags (select 2-5 from: ${SENSORY_TAGS.map(t => `${t.label} (${t.id})`).join(', ')})

Description: "${description}"

Return a JSON object with:
{
  "emotionTags": [{"id": "tag_id", "emoji": "emoji", "label": "Label", "category": "positive|negative|neutral"}],
  "sensoryTags": [{"id": "tag_id", "emoji": "emoji", "label": "Label", "category": "sound|light|air|smell|space"}]
}

Only use the exact tag IDs from the provided lists.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Map to our tag structure
    const emotionTags: EmotionTag[] = (parsed.emotionTags || []).map((tag: any) => {
      const found = EMOTION_TAGS.find((t) => t.id === tag.id);
      return found || tag;
    });

    const sensoryTags: SensoryTag[] = (parsed.sensoryTags || []).map((tag: any) => {
      const found = SENSORY_TAGS.find((t) => t.id === tag.id);
      return found || tag;
    });

    return { emotionTags, sensoryTags };
  } catch (error: any) {
    console.error('Error extracting tags from description:', error);
    throw new Error('Failed to extract tags from description');
  }
}

