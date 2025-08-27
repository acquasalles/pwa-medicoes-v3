/*
  # Adicionar Política de INSERT Segura para Medição

  Esta migração adiciona APENAS uma nova política de INSERT para a tabela medicao,
  sem modificar ou remover políticas existentes.

  ## Mudanças:
  1. Adiciona função is_admin() se não existir (apenas leitura, não modifica usuários)
  2. Adiciona política específica para INSERT na medicao
  3. Não altera políticas existentes
  4. Usa nomes únicos para evitar conflitos

  ## Reversão:
  Para reverter, execute: DROP POLICY IF EXISTS "PWA_medicao_insert_policy" ON medicao;
*/

-- 1. Criar função is_admin() apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin'
  ) THEN
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      -- Implementação básica: sempre retorna true para service_role
      -- Você pode customizar esta lógica conforme sua necessidade
      SELECT current_setting('role') = 'service_role'
        OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin'
        OR current_user = 'postgres';
    $$;
    
    RAISE NOTICE 'Função is_admin() criada com sucesso';
  ELSE
    RAISE NOTICE 'Função is_admin() já existe, pulando criação';
  END IF;
END $$;

-- 2. Adicionar política de INSERT específica para o PWA (sem afetar outras)
DO $$
BEGIN
  -- Verifica se a política já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicao' 
    AND policyname = 'PWA_medicao_insert_policy'
  ) THEN
    
    -- Política para INSERT na medicao
    CREATE POLICY "PWA_medicao_insert_policy"
      ON medicao
      FOR INSERT
      TO authenticated
      WITH CHECK (
        -- Permitir se é admin
        is_admin() 
        OR 
        -- Ou se o usuário tem acesso ao cliente através de client_users
        EXISTS (
          SELECT 1 FROM client_users 
          WHERE client_users.client_id = medicao.cliente_id 
          AND client_users.user_id = auth.uid()
        )
      );
      
    RAISE NOTICE 'Política PWA_medicao_insert_policy criada com sucesso';
  ELSE
    RAISE NOTICE 'Política PWA_medicao_insert_policy já existe';
  END IF;
END $$;

-- 3. Verificar resultado
SELECT 
  'Políticas após migração:' as status,
  count(*) as total_policies
FROM pg_policies 
WHERE tablename = 'medicao';

-- Mostrar todas as políticas da tabela medicao
SELECT 
  policyname,
  cmd,
  roles,
  with_check IS NOT NULL as has_with_check
FROM pg_policies 
WHERE tablename = 'medicao'
ORDER BY policyname;