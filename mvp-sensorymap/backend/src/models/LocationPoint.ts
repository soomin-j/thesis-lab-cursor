import pool from '../config/database';

export interface LocationPoint {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  created_at: Date;
}

export interface CreateLocationPointData {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

export class LocationPointModel {
  static async create(data: CreateLocationPointData): Promise<LocationPoint> {
    const result = await pool.query(
      `INSERT INTO location_points (user_id, latitude, longitude, timestamp, accuracy) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        data.user_id,
        data.latitude,
        data.longitude,
        data.timestamp || new Date(),
        data.accuracy || null,
      ]
    );
    return result.rows[0];
  }

  static async findByUserId(userId: string, startDate?: Date, endDate?: Date): Promise<LocationPoint[]> {
    let query = 'SELECT * FROM location_points WHERE user_id = $1';
    const params: any[] = [userId];
    
    if (startDate) {
      query += ' AND timestamp >= $2';
      params.push(startDate);
      if (endDate) {
        query += ' AND timestamp <= $3';
        params.push(endDate);
      }
    } else if (endDate) {
      query += ' AND timestamp <= $2';
      params.push(endDate);
    }
    
    query += ' ORDER BY timestamp ASC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<LocationPoint[]> {
    const result = await pool.query(
      'SELECT * FROM location_points WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3 ORDER BY timestamp ASC',
      [userId, startDate, endDate]
    );
    return result.rows;
  }
}

