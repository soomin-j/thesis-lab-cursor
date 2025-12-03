import express, { Response } from 'express';
import multer from 'multer';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { extractTagsFromPhoto, extractTagsFromDescription } from '../services/openaiService';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// All routes require authentication
router.use(authenticateToken);

// Extract tags from photo and/or description
router.post(
  '/extract-tags',
  upload.single('photo'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { description } = req.body;
      const file = req.file;

      let emotionTags: any[] = [];
      let sensoryTags: any[] = [];

      // Extract from photo if provided
      if (file) {
        try {
          const photoTags = await extractTagsFromPhoto(file.path);
          emotionTags = [...emotionTags, ...photoTags.emotionTags];
          sensoryTags = [...sensoryTags, ...photoTags.sensoryTags];
        } catch (error) {
          console.error('Error extracting from photo:', error);
        }
      }

      // Extract from description if provided
      if (description) {
        try {
          const descTags = await extractTagsFromDescription(description);
          emotionTags = [...emotionTags, ...descTags.emotionTags];
          sensoryTags = [...sensoryTags, ...descTags.sensoryTags];
        } catch (error) {
          console.error('Error extracting from description:', error);
        }
      }

      // Remove duplicates
      const uniqueEmotionTags = Array.from(
        new Map(emotionTags.map((tag) => [tag.id, tag])).values()
      );
      const uniqueSensoryTags = Array.from(
        new Map(sensoryTags.map((tag) => [tag.id, tag])).values()
      );

      res.json({
        emotionTags: uniqueEmotionTags,
        sensoryTags: uniqueSensoryTags,
      });
    } catch (error: any) {
      console.error('Error extracting tags:', error);
      res.status(500).json({ error: 'Failed to extract tags' });
    }
  }
);

export default router;

