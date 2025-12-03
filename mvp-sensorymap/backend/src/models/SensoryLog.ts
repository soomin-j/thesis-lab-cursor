import pool from '../config/database';

export interface EmotionTag {
  id: string;
  emoji: string;
  label: string;
  category: 'positive' | 'negative' | 'neutral';
}

export interface SensoryTag {
  id: string;
  emoji: string;
  label: string;
  category: 'sound' | 'light' | 'air' | 'smell' | 'space';
}

export interface SensoryLog {
  id: string;
  user_id: string;
  location_id?: string;
  timestamp: Date;
  photo_url?: string;
  description?: string;
  emotion_tags: EmotionTag[];
  sensory_tags: SensoryTag[];
  ai_extracted: boolean;
  created_at: Date;
}

export interface CreateSensoryLogData {
  user_id: string;
  location_id?: string;
  photo_url?: string;
  description?: string;
  emotion_tags?: EmotionTag[];
  sensory_tags?: SensoryTag[];
  ai_extracted?: boolean;
  timestamp?: Date;
}

export class SensoryLogModel {
  static async create(data: CreateSensoryLogData): Promise<SensoryLog> {
    const result = await pool.query(
      `INSERT INTO sensory_logs (user_id, location_id, timestamp, photo_url, description, emotion_tags, sensory_tags, ai_extracted) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        data.user_id,
        data.location_id || null,
        data.timestamp || new Date(),
        data.photo_url || null,
        data.description || null,
        JSON.stringify(data.emotion_tags || []),
        JSON.stringify(data.sensory_tags || []),
        data.ai_extracted || false,
      ]
    );
    return result.rows[0];
  }

  static async findByUserId(userId: string): Promise<SensoryLog[]> {
    const result = await pool.query(
      'SELECT * FROM sensory_logs WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );
    return result.rows;
  }

  static async findByUserIdAndDate(userId: string, date: Date): Promise<SensoryLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await pool.query(
      'SELECT * FROM sensory_logs WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3 ORDER BY timestamp ASC',
      [userId, startOfDay, endOfDay]
    );
    return result.rows;
  }

  static async findByLocationRadius(
    latitude: number,
    longitude: number,
    radius: number = 0.001
  ): Promise<SensoryLog[]> {
    const result = await pool.query(
      `SELECT sl.* FROM sensory_logs sl
       JOIN location_points lp ON sl.location_id = lp.id
       WHERE (
         6371000 * acos(
           cos(radians($1)) * cos(radians(lp.latitude)) *
           cos(radians(lp.longitude) - radians($2)) +
           sin(radians($1)) * sin(radians(lp.latitude))
         )
       ) <= $3
       ORDER BY sl.timestamp DESC`,
      [latitude, longitude, radius * 1000] // Convert km to meters
    );
    return result.rows;
  }
}

