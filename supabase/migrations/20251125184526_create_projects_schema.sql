/*
  # CharaPlace Projects Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key) - Unique project identifier
      - `user_id` (uuid) - User who created the project (for future auth)
      - `name` (text) - Project name
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `compositions`
      - `id` (uuid, primary key) - Unique composition identifier
      - `project_id` (uuid, foreign key) - Reference to parent project
      - `background_image_url` (text) - URL/path to background image
      - `layout_guide_url` (text, nullable) - URL/path to layout guide
      - `generated_image_url` (text, nullable) - URL/path to final generated image
      - `upscaled_image_url` (text, nullable) - URL/path to upscaled version
      - `created_at` (timestamptz) - Creation timestamp

    - `characters`
      - `id` (uuid, primary key) - Unique character identifier
      - `composition_id` (uuid, foreign key) - Reference to composition
      - `image_url` (text) - URL/path to character image
      - `art_style` (text) - Art style preference
      - `position_x` (real) - X position in composition
      - `position_y` (real) - Y position in composition
      - `width` (real) - Width of character placement
      - `height` (real) - Height of character placement
      - `action` (text) - Action description for the character
      - `order_index` (int) - Order in the composition
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (for MVP, can be restricted later with auth)
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  name text NOT NULL DEFAULT 'Untitled Project',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create compositions table
CREATE TABLE IF NOT EXISTS compositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  background_image_url text NOT NULL,
  layout_guide_url text,
  generated_image_url text,
  upscaled_image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  composition_id uuid REFERENCES compositions(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  art_style text NOT NULL DEFAULT 'Hyper Realistic',
  position_x real NOT NULL DEFAULT 0,
  position_y real NOT NULL DEFAULT 0,
  width real NOT NULL DEFAULT 100,
  height real NOT NULL DEFAULT 100,
  action text DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (MVP - can be restricted later)
CREATE POLICY "Allow public read access to projects"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to projects"
  ON projects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to projects"
  ON projects
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from projects"
  ON projects
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to compositions"
  ON compositions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to compositions"
  ON compositions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to compositions"
  ON compositions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from compositions"
  ON compositions
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to characters"
  ON characters
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to characters"
  ON characters
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to characters"
  ON characters
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from characters"
  ON characters
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_compositions_project_id ON compositions(project_id);
CREATE INDEX IF NOT EXISTS idx_characters_composition_id ON characters(composition_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
