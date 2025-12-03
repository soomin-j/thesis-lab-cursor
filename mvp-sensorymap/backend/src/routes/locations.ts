import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { LocationPointModel } from '../models/LocationPoint';
import { getSensorySummary } from '../services/aggregationService';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create location point
router.post(
  '/',
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('accuracy').optional().isFloat(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { latitude, longitude, accuracy, timestamp } = req.body;

      const locationPoint = await LocationPointModel.create({
        user_id: req.user!.userId,
        latitude,
        longitude,
        accuracy,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });

      res.status(201).json(locationPoint);
    } catch (error: any) {
      console.error('Error creating location point:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get user's location history
router.get('/user/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify user can only access their own data
    if (userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let locationPoints;
    if (startDate && endDate) {
      locationPoints = await LocationPointModel.findByDateRange(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else {
      locationPoints = await LocationPointModel.findByUserId(userId);
    }

    res.json(locationPoints);
  } catch (error: any) {
    console.error('Error fetching location points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sensory summary for a location
router.get(
  '/:lat/:lng/sensory-summary',
  [query('radius').optional().isFloat({ min: 0.0001, max: 0.01 })],
  async (req: AuthRequest, res: Response) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lng = parseFloat(req.params.lng);
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 0.001;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }

      const summary = await getSensorySummary(lat, lng, radius);
      res.json(summary);
    } catch (error: any) {
      console.error('Error fetching sensory summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

