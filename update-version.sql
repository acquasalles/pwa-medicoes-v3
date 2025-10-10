INSERT INTO app_versions (version, minimum_version, force_update, release_notes)
VALUES ('1.2.1', '1.2.1', true, 'Atualização obrigatória - Versão 1.2.1')
ON CONFLICT (version) DO UPDATE
SET minimum_version = EXCLUDED.minimum_version,
    force_update = EXCLUDED.force_update,
    release_notes = EXCLUDED.release_notes,
    updated_at = now();
