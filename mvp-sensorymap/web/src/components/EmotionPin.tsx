import L from 'leaflet';
import { EmotionTag } from '../types';

export default class EmotionPin {
  static createIcon(emotion: EmotionTag) {
    // Soft, ambient colors for calm and emotional resonance
    const getColor = () => {
      switch (emotion.category) {
        case 'positive':
          return '#A8D5BA'; // Soft mint green
        case 'negative':
          return '#E8B4B8'; // Soft rose
        case 'neutral':
          return '#D4C5E0'; // Soft lavender
        default:
          return '#B8D4E3'; // Soft sky blue
      }
    };

    const getBorderColor = () => {
      switch (emotion.category) {
        case 'positive':
          return '#7FB8A1'; // Deeper mint
        case 'negative':
          return '#D89BA0'; // Deeper rose
        case 'neutral':
          return '#C4B0D4'; // Deeper lavender
        default:
          return '#9FC4D3'; // Deeper sky
      }
    };

    const borderColor = getBorderColor();
    const bgColor = getColor();
    
    return L.divIcon({
      className: 'emotion-pin',
      html: `
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${bgColor};
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid ${borderColor};
          box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 0 0 4px rgba(255,255,255,0.5);
          font-size: 26px;
          backdrop-filter: blur(10px);
        ">
          ${emotion.emoji}
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  }
}

