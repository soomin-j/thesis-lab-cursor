import { Mood, Location } from './types';

export function getRecommendedLocations(mood: Mood, locations: Location[]): Location[] {
  if (mood === 'neutral') return locations;

  return locations.filter(loc => {
    switch (mood) {
      case 'anxious':
        // Needs Calming: Quiet, nature, not crowded
        return (
          (loc.sensory.sound === 'quiet' || loc.sensory.sound === 'moderate') &&
          (loc.sensory.crowd === 'empty' || loc.sensory.crowd === 'sparse') &&
          loc.sensory.light !== 'neon'
        );
      
      case 'overwhelmed':
        // Needs Grounding: Very quiet, dim/natural
        return (
          loc.sensory.sound === 'quiet' &&
          (loc.sensory.light === 'dim' || loc.sensory.light === 'natural')
        );

      case 'energetic':
        // Wants Action: Can handle noise, crowds, brightness
        return (
          loc.sensory.crowd === 'moderate' || 
          loc.sensory.crowd === 'crowded' ||
          loc.sensory.vibe.includes('electric')
        );

      case 'melancholic':
        // Needs Comfort: Cozy, uplifting vibes
        return (
          loc.sensory.vibe.includes('cozy') || 
          loc.sensory.vibe.includes('uplifting') ||
          loc.sensory.category === 'park'
        );

      case 'bored':
        // Needs Stimulation: Neon, chaos, loudness
        return (
          loc.sensory.light === 'neon' || 
          loc.sensory.sound === 'loud' || 
          loc.sensory.vibe.includes('chaotic')
        );
      
      default:
        return true;
    }
  });
}

export function getMoodColor(mood: Mood): string {
  switch (mood) {
    case 'anxious': return 'text-sky-600';
    case 'overwhelmed': return 'text-stone-600';
    case 'energetic': return 'text-orange-600';
    case 'melancholic': return 'text-rose-600';
    case 'bored': return 'text-violet-600';
    default: return 'text-slate-600';
  }
}

