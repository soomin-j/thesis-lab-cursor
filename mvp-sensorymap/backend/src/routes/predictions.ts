import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { predictSensoryExperience } from '../services/predictionService';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get prediction for a location
router.post(
  '/feel',
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('userPreferences').optional().isObject(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { latitude, longitude, userPreferences } = req.body;

      const prediction = await predictSensoryExperience({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        userId: req.user!.userId,
        userPreferences,
      });

      res.json(prediction);
    } catch (error: any) {
      console.error('Error generating prediction:', error);
      res.status(500).json({ error: 'Failed to generate prediction' });
    }
  }
);

export default router;

