-- ============================================
-- V5: Añadir DEFAULT CURRENT_TIMESTAMP
-- ============================================

ALTER TABLE usuario
    ALTER COLUMN fecha_creacion SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE solicitud
    ALTER COLUMN fecha_creacion SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE valoracion
    ALTER COLUMN fecha_creacion SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN usuario.fecha_creacion IS 'Fecha de registro (LocalDateTime)';
COMMENT ON COLUMN solicitud.fecha_creacion IS 'Fecha de creación (LocalDateTime)';
COMMENT ON COLUMN valoracion.fecha_creacion IS 'Fecha de creación (LocalDateTime)';