-- Desativar versão anterior
UPDATE app_version SET is_active = false WHERE is_active = true;

-- Inserir nova versão 1.2.1 como ativa e obrigatória
INSERT INTO app_version (version, release_date, force_update, description, is_active)
VALUES (
  '1.2.1',
  now(),
  true,
  'Atualização obrigatória - Versão 1.2.1',
  true
)
ON CONFLICT (version) DO UPDATE
SET force_update = EXCLUDED.force_update,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    release_date = now();
