import L from 'leaflet';
import { EmotionTag } from '../types';

export default class EmotionPin {
  static createIcon(emotion: EmotionTag) {
    // Sticker-style design (White background, large emoji, soft shadow)
    
    return L.divIcon({
      className: 'emotion-pin',
      html: `
        <div style="
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          font-size: 32px;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        ">
          ${emotion.emoji}
        </div>
      `,
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });
  }
}
