import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  preferences?: Record<string, any>;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  preferences?: Record<string, any>;
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, preferences) VALUES ($1, $2, $3) RETURNING *',
      [data.email, data.password_hash, JSON.stringify(data.preferences || {})]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async updatePreferences(userId: string, preferences: Record<string, any>): Promise<User> {
    const result = await pool.query(
      'UPDATE users SET preferences = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(preferences), userId]
    );
    return result.rows[0];
  }
}

