/*
  # Corrigir políticas RLS para tabela medicao

  Este migration corrige as políticas RLS da tabela `medicao` para permitir INSERT
  de usuários autenticados com as devidas permissões.

  ## Problema Identificado
  - SELECT funciona (política existente)
  - INSERT falha (sem política adequada para usuários autenticados)
  - is_admin() retorna true mas ainda assim INSERT é bloqueado

  ## Solução
  1. Adicionar política para INSERT de usuários admin
  2. Adicionar política para INSERT de usuários com acesso via client_users
  3. Manter segurança garantindo que usuários só inserem em clientes autorizados
*/

-- Remover política existente se existir para recriar
DROP POLICY IF EXISTS "Admins and authorized users can insert measurements" ON medicao;
DROP POLICY IF EXISTS "Admins can insert measurements" ON medicao;
DROP POLICY IF EXISTS "Authorized users can insert measurements" ON medicao;

-- Política para administradores - podem inserir qualquer medição
CREATE POLICY "Admins can insert measurements"
  ON medicao
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Política para usuários autorizados - podem inserir apenas em clientes onde têm acesso
CREATE POLICY "Authorized users can insert measurements"
  ON medicao
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 
      FROM client_users 
      WHERE client_users.client_id = medicao.cliente_id 
        AND client_users.user_id = auth.uid()
    )
  );

-- Política combinada (alternativa mais simples)
CREATE POLICY "Admins and authorized users can insert measurements"
  ON medicao
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin() OR 
    EXISTS (
      SELECT 1 
      FROM client_users 
      WHERE client_users.client_id = medicao.cliente_id 
        AND client_users.user_id = auth.uid()
    )
  );

-- Verificar se as funções necessárias existem
DO $$
BEGIN
  -- Verificar se is_admin() existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_admin' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Criar função is_admin() se não existir
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS boolean AS $$
    BEGIN
      -- Por enquanto, retorna true para todos os usuários autenticados
      -- Você pode ajustar esta lógica conforme suas necessidades
      RETURN auth.uid() IS NOT NULL;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END $$;