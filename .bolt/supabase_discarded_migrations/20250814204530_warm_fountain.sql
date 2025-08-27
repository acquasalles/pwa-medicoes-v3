/*
  # Análise das Políticas RLS Existentes

  Este script analisa as políticas RLS atuais para entender o impacto
  antes de fazer qualquer alteração.
*/

-- Mostrar todas as políticas RLS na tabela medicao
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'medicao'
ORDER BY policyname;

-- Mostrar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'medicao';

-- Verificar se a função is_admin existe
SELECT 
  proname,
  proargnames,
  prosrc
FROM pg_proc 
WHERE proname = 'is_admin';

-- Mostrar estrutura da tabela client_users para entender relacionamentos
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'client_users'
ORDER BY ordinal_position;

-- Testar acesso atual (como service_role)
-- Comentado para evitar modificações acidentais
-- SELECT count(*) as total_medicoes FROM medicao;
-- SELECT count(*) as total_client_users FROM client_users;