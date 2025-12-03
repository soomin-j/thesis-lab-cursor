import express, { Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { SensoryLogModel } from '../models/SensoryLog';
import { LocationPointModel } from '../models/LocationPoint';
import path from 'path';
import fs from 'fs';

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

// Create sensory log entry
router.post(
  '/',
  upload.single('photo'),
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('description').optional().isString(),
    body('emotionTags').optional().isString(),
    body('sensoryTags').optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { latitude, longitude, description, emotionTags, sensoryTags } = req.body;
      const file = req.file;

      // Create or find location point
      let locationPoint;
      const existingLocations = await LocationPointModel.findByUserId(req.user!.userId);
      const recentLocation = existingLocations.find(
        (loc) =>
          Math.abs(loc.latitude - parseFloat(latitude)) < 0.0001 &&
          Math.abs(loc.longitude - parseFloat(longitude)) < 0.0001
      );

      if (recentLocation) {
        locationPoint = recentLocation;
      } else {
        locationPoint = await LocationPointModel.create({
          user_id: req.user!.userId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        });
      }

      // Handle photo upload
      let photoUrl = null;
      if (file) {
        // In production, upload to cloud storage (S3, Cloudinary, etc.)
        // For MVP, store locally
        photoUrl = `/uploads/${file.filename}`;
      }

      // Parse tags
      const parsedEmotionTags = emotionTags ? JSON.parse(emotionTags) : [];
      const parsedSensoryTags = sensoryTags ? JSON.parse(sensoryTags) : [];

      // Create sensory log
      const sensoryLog = await SensoryLogModel.create({
        user_id: req.user!.userId,
        location_id: locationPoint.id,
        photo_url: photoUrl,
        description,
        emotion_tags: parsedEmotionTags,
        sensory_tags: parsedSensoryTags,
        ai_extracted: false,
      });

      res.status(201).json(sensoryLog);
    } catch (error: any) {
      console.error('Error creating sensory log:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get user's sensory logs
router.get('/user/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own data
    if (userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const logs = await SensoryLogModel.findByUserId(userId);
    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching sensory logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's daily sensory logs
router.get('/user/:userId/daily/:date', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, date } = req.params;

    // Verify user can only access their own data
    if (userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const targetDate = new Date(date);
    const logs = await SensoryLogModel.findByUserIdAndDate(userId, targetDate);
    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching daily sensory logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

