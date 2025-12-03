import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/jwt';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const user = await UserModel.create({
        email,
        password_hash,
        preferences: {},
      });

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
        },
        token,
        refreshToken,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      res.json({
        user: {
          id: user.id,
          email: user.email,
        },
        token,
        refreshToken,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const { verifyToken } = require('../utils/jwt');
    const payload = verifyToken(refreshToken);

    // Generate new tokens
    const token = generateToken({ userId: payload.userId, email: payload.email });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email });

    res.json({
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error: any) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

export default router;

