import { Location } from '../lib/types';

export const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Central Park - Sheep Meadow',
    position: [40.771133, -73.974187],
    category: 'park',
    description: 'Expansive green space, perfect for grounding.',
    sensory: {
      sound: 'quiet',
      light: 'natural',
      crowd: 'moderate',
      vibe: ['zen', 'uplifting']
    }
  },
  {
    id: '2',
    name: 'The Rose Reading Room',
    position: [40.753182, -73.982253],
    category: 'library',
    description: 'Silent, majestic, and dimly lit architecture.',
    sensory: {
      sound: 'quiet',
      light: 'dim',
      crowd: 'sparse',
      vibe: ['cozy', 'awe']
    }
  },
  {
    id: '3',
    name: 'Times Square',
    position: [40.7580, -73.9855],
    category: 'plaza',
    description: 'The center of the universe. Bright lights, loud noise.',
    sensory: {
      sound: 'loud',
      light: 'neon',
      crowd: 'crowded',
      vibe: ['chaotic', 'electric']
    }
  },
  {
    id: '4',
    name: 'Little Cupcake Bakeshop',
    position: [40.7233, -73.9964],
    category: 'cafe',
    description: 'Sweet smells and warm lighting.',
    sensory: {
      sound: 'moderate',
      light: 'natural',
      crowd: 'moderate',
      vibe: ['cozy', 'uplifting']
    }
  },
  {
    id: '5',
    name: 'High Line - North End',
    position: [40.7525, -74.0028],
    category: 'park',
    description: 'Elevated railway park with river views.',
    sensory: {
      sound: 'moderate',
      light: 'natural',
      crowd: 'moderate',
      vibe: ['zen', 'industrial']
    }
  },
  {
    id: '6',
    name: 'Subway Station - Union Sq',
    position: [40.7350, -73.9906],
    category: 'street',
    description: 'Busy transit hub.',
    sensory: {
      sound: 'loud',
      light: 'dim',
      crowd: 'crowded',
      vibe: ['chaotic', 'industrial']
    }
  }
];

