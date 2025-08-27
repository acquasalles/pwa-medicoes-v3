/*
  # Verificar acesso do usuário atual
  
  Este script ajuda a diagnosticar problemas de acesso do usuário.
  Execute para ver o estado atual do usuário e suas permissões.
*/

-- 1. Mostrar informações do usuário atual
SELECT 
    'Informações do usuário atual:' as info,
    current_user as current_database_user,
    current_setting('request.jwt.claims', true) as jwt_claims;

-- 2. Verificar se a função is_admin() existe e funciona
SELECT 
    'Testando is_admin():' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') 
        THEN 'Função exists'
        ELSE 'Função NOT exists'
    END as admin_function_status;

-- 3. Ver todos os registros em client_users (para admin diagnosticar)
SELECT 
    'Registros em client_users:' as info,
    count(*) as total_records
FROM client_users;

-- 4. Ver sample de client_users para entender estrutura
SELECT 
    'Sample client_users records:' as info,
    id,
    left(user_id::text, 8) || '...' as user_id_truncated,
    client_id,
    created_at
FROM client_users
ORDER BY created_at DESC
LIMIT 5;

-- 5. Ver clientes disponíveis
SELECT 
    'Clientes disponíveis:' as info,
    id,
    razao_social,
    cidade,
    uf
FROM clientes
ORDER BY razao_social
LIMIT 5;

-- 6. Verificar políticas RLS na tabela client_users
SELECT 
    'Políticas RLS client_users:' as info,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'client_users'
ORDER BY policyname;