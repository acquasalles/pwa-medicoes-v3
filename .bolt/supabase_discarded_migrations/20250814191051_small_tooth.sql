/*
  # Enhance measurement types for dynamic inputs

  1. New Columns
    - `input_type` (text) - Controls the type of input field (number, photo, text, select, etc.)
    - `decimal_places` (integer) - Number of decimal places for numeric inputs
    - `options` (jsonb) - Options for select inputs or additional configurations
    - `validation_rules` (jsonb) - Custom validation rules
    - `unit` (text) - Unit of measurement for display

  2. Updates
    - Add default values for existing records
    - Add helpful constraints
*/

-- Add new columns to tipos_medicao table
DO $$
BEGIN
  -- Add input_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tipos_medicao' AND column_name = 'input_type'
  ) THEN
    ALTER TABLE tipos_medicao ADD COLUMN input_type text DEFAULT 'number';
  END IF;

  -- Add decimal_places column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tipos_medicao' AND column_name = 'decimal_places'
  ) THEN
    ALTER TABLE tipos_medicao ADD COLUMN decimal_places integer DEFAULT 2;
  END IF;

  -- Add options column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tipos_medicao' AND column_name = 'options'
  ) THEN
    ALTER TABLE tipos_medicao ADD COLUMN options jsonb;
  END IF;

  -- Add validation_rules column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tipos_medicao' AND column_name = 'validation_rules'
  ) THEN
    ALTER TABLE tipos_medicao ADD COLUMN validation_rules jsonb;
  END IF;

  -- Add unit column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tipos_medicao' AND column_name = 'unit'
  ) THEN
    ALTER TABLE tipos_medicao ADD COLUMN unit text;
  END IF;
END $$;

-- Insert sample measurement types with different input configurations
INSERT INTO tipos_medicao (nome, tipo, input_type, decimal_places, unit, range, validation_rules, options) VALUES
('pH', 'químico', 'number', 1, 'pH', '{"min": 0, "max": 14}', '{"required": true}', '{"step": 0.1}'),
('Temperatura', 'físico', 'number', 1, '°C', '{"min": -50, "max": 100}', '{"required": true}', '{"step": 0.1}'),
('Foto do Local', 'visual', 'photo', 0, '', NULL, '{"required": true}', '{"accept": "image/*", "maxSize": "5MB"}'),
('Turbidez', 'físico', 'number', 2, 'NTU', '{"min": 0, "max": 1000}', '{"required": true}', '{"step": 0.01}'),
('Condutividade', 'físico', 'number', 0, 'µS/cm', '{"min": 0, "max": 10000}', '{"required": true}', '{"step": 1}'),
('Cor Aparente', 'visual', 'select', 0, '', NULL, '{"required": true}', '{"options": ["Incolor", "Amarelo Claro", "Amarelo", "Marrom Claro", "Marrom"]}'),
('Odor', 'sensorial', 'select', 0, '', NULL, '{"required": true}', '{"options": ["Inodoro", "Cloro", "Terra", "Mofo", "Químico", "Outros"]}'),
('Observações', 'texto', 'textarea', 0, '', NULL, '{"required": false}', '{"maxLength": 500, "rows": 3}')
ON CONFLICT (nome) DO UPDATE SET
  input_type = EXCLUDED.input_type,
  decimal_places = EXCLUDED.decimal_places,
  unit = EXCLUDED.unit,
  range = EXCLUDED.range,
  validation_rules = EXCLUDED.validation_rules,
  options = EXCLUDED.options;