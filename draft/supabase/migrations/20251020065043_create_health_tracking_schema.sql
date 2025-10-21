/*
  # Health Tracking Application Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `name` (text) - User's full name
      - `age_group` (text) - User's age group/range
      - `weight` (decimal) - User's weight in kg
      - `height` (decimal) - User's height in cm
      - `bmi` (decimal) - Calculated Body Mass Index
      - `goal` (text) - User's fitness goal: 'maintain', 'lose', or 'gain'
      - `preferred_activity` (text) - User's preferred type of activity
      - `recommended_calories` (integer) - Daily recommended calorie intake
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last profile update timestamp

    - `activity_logs`
      - `id` (uuid, primary key) - Unique activity log identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `activity_name` (text) - Name of the activity
      - `activity_date` (date) - Date when activity was performed
      - `duration` (integer) - Duration in minutes
      - `calories_burnt` (integer) - Calories burnt during activity
      - `location` (text) - Location where activity was performed
      - `is_outdoor` (boolean) - Whether activity was outdoors or indoors
      - `completion_percentage` (integer) - Progress percentage (0-100)
      - `created_at` (timestamptz) - Log creation timestamp

    - `weekly_plans`
      - `id` (uuid, primary key) - Unique plan identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `week_start_date` (date) - Start date of the week
      - `day_of_week` (integer) - Day number (1-7, Monday-Sunday)
      - `activity_name` (text) - Planned activity name
      - `duration` (integer) - Planned duration in minutes
      - `estimated_calories` (integer) - Expected calories to burn
      - `location` (text) - Planned location
      - `is_outdoor` (boolean) - Indoor or outdoor activity
      - `created_at` (timestamptz) - Plan creation timestamp

    - `tree_logs`
      - `id` (uuid, primary key) - Unique tree identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `tree_name` (text) - Name/title of the tree
      - `week_start_date` (date) - Start date of tracking week
      - `week_end_date` (date) - End date of tracking week
      - `total_calories_burnt` (integer) - Total calories burnt that week
      - `growth_percentage` (integer) - Tree growth level (0-100)
      - `size` (text) - Tree size: 'small', 'medium', 'large'
      - `color` (text) - Tree color/appearance
      - `is_fully_grown` (boolean) - Whether weekly goal was met
      - `created_at` (timestamptz) - Tree creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own records
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  age_group text DEFAULT '',
  weight decimal(5,2) DEFAULT 0,
  height decimal(5,2) DEFAULT 0,
  bmi decimal(4,2) DEFAULT 0,
  goal text DEFAULT 'maintain' CHECK (goal IN ('maintain', 'lose', 'gain')),
  preferred_activity text DEFAULT '',
  recommended_calories integer DEFAULT 2000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_name text NOT NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  duration integer NOT NULL DEFAULT 0,
  calories_burnt integer NOT NULL DEFAULT 0,
  location text DEFAULT '',
  is_outdoor boolean DEFAULT false,
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at timestamptz DEFAULT now()
);

-- Create weekly_plans table
CREATE TABLE IF NOT EXISTS weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  activity_name text NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  estimated_calories integer NOT NULL DEFAULT 0,
  location text DEFAULT '',
  is_outdoor boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create tree_logs table
CREATE TABLE IF NOT EXISTS tree_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tree_name text NOT NULL,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  total_calories_burnt integer DEFAULT 0,
  growth_percentage integer DEFAULT 0 CHECK (growth_percentage >= 0 AND growth_percentage <= 100),
  size text DEFAULT 'small' CHECK (size IN ('small', 'medium', 'large')),
  color text DEFAULT '#ADC178',
  is_fully_grown boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for activity_logs table
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own activity logs"
  ON activity_logs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own activity logs"
  ON activity_logs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for weekly_plans table
CREATE POLICY "Users can view own weekly plans"
  ON weekly_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own weekly plans"
  ON weekly_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own weekly plans"
  ON weekly_plans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own weekly plans"
  ON weekly_plans FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for tree_logs table
CREATE POLICY "Users can view own tree logs"
  ON tree_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own tree logs"
  ON tree_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tree logs"
  ON tree_logs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tree logs"
  ON tree_logs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(activity_date);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_id ON weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_week ON weekly_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_tree_logs_user_id ON tree_logs(user_id);