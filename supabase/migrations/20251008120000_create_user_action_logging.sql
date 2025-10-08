/*
  # Create User Action Logging System

  ## Overview
  Sistema de rastreamento de ações do usuário para diagnosticar problemas
  com salvamento de medições, especialmente para tipos PH, Cloro e Foto.

  ## New Tables

  ### `user_action_config`
  Configuração global do sistema de logging
  - `id` (int, primary key) - ID único
  - `is_enabled` (boolean) - Flag para habilitar/desabilitar logging
  - `updated_at` (timestamptz) - Última atualização da configuração
  - `updated_by` (uuid) - Usuário que atualizou

  ### `user_action_logs`
  Logs de ações dos usuários
  - `id` (uuid, primary key) - ID único do log
  - `user_id` (uuid) - ID do usuário que executou a ação
  - `user_email` (text) - Email do usuário
  - `user_ip` (text) - Endereço IP do usuário
  - `action_type` (text) - Tipo de ação (medicao_attempt, medicao_success, medicao_error, sync_attempt, etc)
  - `action_data` (jsonb) - Dados completos da ação
  - `error_data` (jsonb) - Dados de erro, se houver
  - `browser_info` (jsonb) - Informações do navegador
  - `device_info` (jsonb) - Informações do dispositivo
  - `network_status` (text) - Status da rede (online/offline)
  - `cliente_id` (int) - ID do cliente relacionado
  - `area_de_trabalho_id` (text) - ID da área de trabalho
  - `ponto_de_coleta_id` (text) - ID do ponto de coleta
  - `tipo_medicao_id` (text) - ID do tipo de medição
  - `tipo_medicao_nome` (text) - Nome do tipo de medição
  - `raw_value` (text) - Valor bruto do input
  - `processed_value` (text) - Valor após processamento
  - `final_value` (text) - Valor final enviado
  - `is_critical_type` (boolean) - Flag para tipos críticos (PH, Cloro, Foto)
  - `created_at` (timestamptz) - Data de criação do log

  ## Security
  - RLS habilitado em ambas as tabelas
  - Apenas admins podem visualizar e gerenciar configuração
  - Apenas admins podem visualizar todos os logs
  - Usuários comuns podem inserir seus próprios logs
  - Logs são imutáveis (sem UPDATE/DELETE por usuários)

  ## Indexes
  - Índice em user_id para queries por usuário
  - Índice em action_type para filtrar por tipo de ação
  - Índice em tipo_medicao_nome para filtrar tipos específicos
  - Índice em created_at para ordenação temporal
  - Índice em is_critical_type para filtros de tipos críticos
  - Índice composto em (tipo_medicao_nome, created_at) para queries otimizadas
*/

-- Create user_action_config table
CREATE TABLE IF NOT EXISTS user_action_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert default configuration
INSERT INTO user_action_config (id, is_enabled, updated_at)
VALUES (1, true, now())
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on user_action_config
ALTER TABLE user_action_config ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view config
CREATE POLICY "Admins can view user action config"
  ON user_action_config
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Only admins can update config
CREATE POLICY "Admins can update user action config"
  ON user_action_config
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create user_action_logs table
CREATE TABLE IF NOT EXISTS user_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_ip TEXT,
  action_type TEXT NOT NULL,
  action_data JSONB DEFAULT '{}'::jsonb,
  error_data JSONB,
  browser_info JSONB,
  device_info JSONB,
  network_status TEXT,
  cliente_id INTEGER,
  area_de_trabalho_id TEXT,
  ponto_de_coleta_id TEXT,
  tipo_medicao_id TEXT,
  tipo_medicao_nome TEXT,
  raw_value TEXT,
  processed_value TEXT,
  final_value TEXT,
  is_critical_type BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on user_action_logs
ALTER TABLE user_action_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all user action logs"
  ON user_action_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Authenticated users can insert their own logs
CREATE POLICY "Users can insert their own action logs"
  ON user_action_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    user_id IS NULL
  );

-- Policy: Admins can delete old logs for maintenance
CREATE POLICY "Admins can delete old logs"
  ON user_action_logs
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_action_logs_user_id
  ON user_action_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_user_action_logs_action_type
  ON user_action_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_user_action_logs_tipo_medicao_nome
  ON user_action_logs(tipo_medicao_nome);

CREATE INDEX IF NOT EXISTS idx_user_action_logs_created_at
  ON user_action_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_action_logs_is_critical
  ON user_action_logs(is_critical_type)
  WHERE is_critical_type = true;

CREATE INDEX IF NOT EXISTS idx_user_action_logs_tipo_created
  ON user_action_logs(tipo_medicao_nome, created_at DESC);

-- Create function to automatically clean old logs (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_user_action_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_action_logs
  WHERE created_at < now() - interval '90 days';
END;
$$;

-- Create GIN index for JSONB fields to enable fast queries
CREATE INDEX IF NOT EXISTS idx_user_action_logs_action_data
  ON user_action_logs USING GIN (action_data);

CREATE INDEX IF NOT EXISTS idx_user_action_logs_error_data
  ON user_action_logs USING GIN (error_data);

-- Add comment for documentation
COMMENT ON TABLE user_action_logs IS 'Logs de ações dos usuários para diagnóstico de problemas com medições de PH, Cloro e Foto';
COMMENT ON TABLE user_action_config IS 'Configuração global do sistema de logging de ações';
