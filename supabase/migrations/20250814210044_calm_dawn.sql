/*
  # Adicionar políticas RLS para INSERT e DELETE na tabela medicao

  Este script adiciona as políticas faltantes para INSERT e DELETE na tabela medicao,
  seguindo a mesma lógica da política SELECT existente.

  ## Políticas criadas:
  1. INSERT: Admins e usuários autorizados podem inserir medições
  2. DELETE: Admins e usuários autorizados podem deletar medições

  ## Lógica de autorização:
  - is_admin() = true OU
  - EXISTS client_users WHERE client_id = medicao.cliente_id AND user_id = auth.uid()

  ## Segurança:
  - Mantém consistência com política SELECT existente
  - Não altera políticas existentes
  - Nomes únicos para evitar conflitos
*/

-- Política para INSERT na tabela medicao
CREATE POLICY "Admins and authorized users can insert measurements"
  ON medicao
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin() OR (
      EXISTS (
        SELECT 1
        FROM client_users
        WHERE client_users.client_id = medicao.cliente_id
        AND client_users.user_id = auth.uid()
      )
    )
  );

-- Política para DELETE na tabela medicao
CREATE POLICY "Admins and authorized users can delete measurements"
  ON medicao
  FOR DELETE
  TO authenticated
  USING (
    is_admin() OR (
      EXISTS (
        SELECT 1
        FROM client_users
        WHERE client_users.client_id = medicao.cliente_id
        AND client_users.user_id = auth.uid()
      )
    )
  );

-- Verificar se as políticas foram criadas
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS criadas com sucesso para a tabela medicao';
  RAISE NOTICE 'Execute o seguinte para verificar:';
  RAISE NOTICE 'SELECT policyname, cmd FROM pg_policies WHERE tablename = ''medicao'';';
END $$;