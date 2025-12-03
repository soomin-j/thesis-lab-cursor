-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Location Points Table
CREATE TABLE IF NOT EXISTS location_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accuracy DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id and timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_location_points_user_id ON location_points(user_id);
CREATE INDEX IF NOT EXISTS idx_location_points_timestamp ON location_points(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_points_lat_lng ON location_points(latitude, longitude);

-- Sensory Logs Table
CREATE TABLE IF NOT EXISTS sensory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES location_points(id) ON DELETE SET NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  photo_url TEXT,
  description TEXT,
  emotion_tags JSONB DEFAULT '[]'::jsonb,
  sensory_tags JSONB DEFAULT '[]'::jsonb,
  ai_extracted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sensory logs
CREATE INDEX IF NOT EXISTS idx_sensory_logs_user_id ON sensory_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sensory_logs_location_id ON sensory_logs(location_id);
CREATE INDEX IF NOT EXISTS idx_sensory_logs_timestamp ON sensory_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensory_logs_emotion_tags ON sensory_logs USING GIN (emotion_tags);
CREATE INDEX IF NOT EXISTS idx_sensory_logs_sensory_tags ON sensory_logs USING GIN (sensory_tags);

-- Aggregated Sensory Data Table (for caching location-based summaries)
CREATE TABLE IF NOT EXISTS aggregated_sensory_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius DECIMAL(10, 2) NOT NULL DEFAULT 0.001, -- ~100 meters default
  aggregated_tags JSONB DEFAULT '{}'::jsonb,
  total_reviews INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_aggregated_location ON aggregated_sensory_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_aggregated_last_updated ON aggregated_sensory_data(last_updated);

