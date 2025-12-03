import { EmotionTag, SensoryTag } from '../types';
import { MockDataService } from './MockDataService';

interface ExtractTagsResponse {
  emotionTags: EmotionTag[];
  sensoryTags: SensoryTag[];
}

// Use mock data instead of API
const USE_MOCK_DATA = true;

class AIService {
  async extractTags(photoUri?: string | null, description?: string): Promise<ExtractTagsResponse> {
    if (USE_MOCK_DATA) {
      return await MockDataService.extractTags(photoUri, description);
    }

    // Original API code (commented out for mock mode)
    // const formData = new FormData();
    // if (photoUri) {
    //   formData.append('photo', {
    //     uri: photoUri,
    //     type: 'image/jpeg',
    //     name: 'photo.jpg',
    //   } as any);
    // }
    // if (description) {
    //   formData.append('description', description);
    // }
    // const response = await api.post('/ai/extract-tags', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    // return response.data;
    
    throw new Error('API mode not available');
  }

  async createSensoryLog(formData: FormData): Promise<any> {
    if (USE_MOCK_DATA) {
      // Extract data from FormData
      const description = (formData as any).get('description') || '';
      const emotionTags = (formData as any).get('emotionTags') || '[]';
      const sensoryTags = (formData as any).get('sensoryTags') || '[]';
      
      return await MockDataService.createSensoryLog({
        description,
        emotionTags,
        sensoryTags,
      });
    }

    // Original API code (commented out for mock mode)
    // const response = await api.post('/logs', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    // return response.data;
    
    throw new Error('API mode not available');
  }
}

export default new AIService();

