-- La tabla se llama app_user en la migración inicial. Si la renombraste a "usuario", cambia el nombre aquí.
ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS direccion      VARCHAR(255),
    ADD COLUMN IF NOT EXISTS codigo_postal  VARCHAR(12);
