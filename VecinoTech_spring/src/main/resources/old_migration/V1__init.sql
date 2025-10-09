-- Activa PostGIS en ESTA base de datos
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE solicitud (
                           id           BIGSERIAL PRIMARY KEY,
                           id_usuario   BIGINT NOT NULL,
                           titulo       VARCHAR(140) NOT NULL,
                           descripcion  TEXT,
                           categoria    VARCHAR(60),
                           geom         geography(Point, 4326) NOT NULL,
                           estado       VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
                           created_at   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_solicitud_geom ON solicitud USING GIST (geom);
