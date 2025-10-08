/*
  # Create App Version Management Table

  ## Overview
  This migration creates a table to manage application versions and control PWA updates.
  The table stores version information using semantic versioning and allows remote control
  of force updates when critical patches are needed.

  ## New Tables
  - `app_version`
    - `id` (uuid, primary key) - Unique identifier for each version record
    - `version` (text, unique, not null) - Semantic version string (e.g., "1.0.0", "1.2.3")
    - `release_date` (timestamptz, not null) - When this version was released
    - `force_update` (boolean, default false) - Whether users must update to this version
    - `description` (text) - Release notes describing what's new in this version
    - `is_active` (boolean, default false) - Whether this is the current active/latest version
    - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on `app_version` table
  - Add policy for public read access (all users can check current version)
  - Add policy for authenticated users to read (for additional version details)
  
  ## Initial Data
  - Insert version 1.0.0 as the initial active version

  ## Important Notes
  1. Only one version should be marked as is_active=true at a time
  2. Version strings must follow semantic versioning format (MAJOR.MINOR.PATCH)
  3. The force_update flag should be used sparingly for critical security updates
  4. Description field supports markdown for rich release notes
*/

-- Create app_version table
CREATE TABLE IF NOT EXISTS app_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text UNIQUE NOT NULL,
  release_date timestamptz NOT NULL DEFAULT now(),
  force_update boolean DEFAULT false,
  description text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT version_format_check CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

-- Create index for quick lookups of active version
CREATE INDEX IF NOT EXISTS idx_app_version_active ON app_version(is_active) WHERE is_active = true;

-- Create index for version ordering
CREATE INDEX IF NOT EXISTS idx_app_version_release_date ON app_version(release_date DESC);

-- Enable RLS
ALTER TABLE app_version ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read version information (public access for PWA update checks)
CREATE POLICY "Anyone can read app versions"
  ON app_version
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only authenticated users can insert new versions (for admin control)
CREATE POLICY "Authenticated users can insert versions"
  ON app_version
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update versions
CREATE POLICY "Authenticated users can update versions"
  ON app_version
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial version 1.0.0
INSERT INTO app_version (version, release_date, force_update, description, is_active)
VALUES (
  '1.0.0',
  now(),
  false,
  'Versão inicial do sistema de medições PWA com funcionalidades:
- Autenticação de usuários
- Seleção hierárquica de cliente/área/ponto
- Cadastro de medições offline-first
- Sincronização automática quando online
- Upload de fotos compactadas
- Interface responsiva e otimizada',
  true
)
ON CONFLICT (version) DO NOTHING;