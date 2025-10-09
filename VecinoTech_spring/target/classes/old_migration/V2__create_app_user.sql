CREATE TABLE IF NOT EXISTS app_user (
    id         BIGSERIAL PRIMARY KEY,
    nombre     VARCHAR(120) NOT NULL,
    email      VARCHAR(180) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    telefono   VARCHAR(30),
    rol        VARCHAR(20) NOT NULL DEFAULT 'USER',
    activo     BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ  NOT NULL DEFAULT now()
    );

CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user(email);
