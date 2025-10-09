-- ============================================
-- Script inicial Flyway para VecinoTech
-- ============================================

-- 1) Extensión geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2) Tabla principal de usuarios
CREATE TABLE usuario (
                         id BIGSERIAL PRIMARY KEY,
                         nombre VARCHAR(80) NOT NULL,
                         email VARCHAR(120) NOT NULL UNIQUE,
                         password_hash VARCHAR(72) NOT NULL,
                         fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                         avatar_url VARCHAR(300),
                         rating_promedio NUMERIC(3,2) DEFAULT 0.0,
                         rating_total INT DEFAULT 0,
                         activo BOOLEAN NOT NULL DEFAULT FALSE
);

-- 3) Datos extendidos de usuario (1:1)
CREATE TABLE usuario_detalle (
                                 usuario_id BIGINT PRIMARY KEY,
                                 telefono VARCHAR(100),
                                 direccion VARCHAR(200),
                                 ciudad VARCHAR(100),
                                 pais VARCHAR(100),
                                 codigo_postal VARCHAR(12),
                                 bio VARCHAR(280),
                                 CONSTRAINT fk_usuario_detalle_usuario
                                     FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
);

-- Índice opcional si vas a filtrar por CP
CREATE INDEX idx_usuario_detalle_cp ON usuario_detalle (codigo_postal);

-- 4) Solicitudes de ayuda
CREATE TABLE solicitud (
                           id BIGSERIAL PRIMARY KEY,
                           solicitante_id BIGINT NOT NULL,
                           voluntario_id BIGINT, -- NULL cuando aún no asignado
                           titulo VARCHAR(120) NOT NULL,
                           descripcion VARCHAR(1000) NOT NULL,
                           categoria VARCHAR(40) NOT NULL,
                           estado VARCHAR(20) NOT NULL, -- p.ej. ABIERTA, EN_PROCESO, CERRADA
                           fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                           ubicacion GEOGRAPHY(Point, 4326), -- lat/lon (WGS84)
                           CONSTRAINT fk_solicitud_solicitante
                               FOREIGN KEY (solicitante_id) REFERENCES usuario (id) ON DELETE CASCADE,
                           CONSTRAINT fk_solicitud_voluntario
                               FOREIGN KEY (voluntario_id) REFERENCES usuario (id) ON DELETE SET NULL
);

-- Índices de solicitud
CREATE INDEX idx_solicitud_estado ON solicitud (estado);
CREATE INDEX idx_solicitud_fecha ON solicitud (fecha_creacion);
CREATE INDEX idx_solicitud_ubicacion ON solicitud USING GIST (ubicacion);

-- 5) Valoraciones de usuarios
CREATE TABLE valoracion (
                            id BIGSERIAL PRIMARY KEY,
                            autor_id BIGINT NOT NULL,      -- quien valora
                            ayudado_id BIGINT NOT NULL,    -- quien recibe la valoración
                            solicitud_id BIGINT NOT NULL,  -- solicitud a la que pertenece la valoración
                            puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
                            comentario VARCHAR(500),
                            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            CONSTRAINT fk_valoracion_autor
                                FOREIGN KEY (autor_id) REFERENCES usuario (id) ON DELETE CASCADE,
                            CONSTRAINT fk_valoracion_ayudado
                                FOREIGN KEY (ayudado_id) REFERENCES usuario (id) ON DELETE CASCADE,
                            CONSTRAINT fk_valoracion_solicitud
                                FOREIGN KEY (solicitud_id) REFERENCES solicitud (id) ON DELETE CASCADE,
                            CONSTRAINT uc_valoracion UNIQUE (autor_id, ayudado_id, solicitud_id)
);

-- Índice para listados rápidos de valoraciones recibidas
CREATE INDEX idx_valoracion_ayudado ON valoracion (ayudado_id);
