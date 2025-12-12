-- ============================================
-- V7: Sistema de valoraciones mejorado
-- ============================================

-- 1) Renombrar columnas de valoracion para mayor claridad
ALTER TABLE valoracion RENAME COLUMN autor_id TO solicitante_id;
ALTER TABLE valoracion RENAME COLUMN ayudado_id TO voluntario_id;

-- Actualizar constraint
ALTER TABLE valoracion DROP CONSTRAINT IF EXISTS uc_valoracion;
ALTER TABLE valoracion
    ADD CONSTRAINT uc_valoracion UNIQUE (solicitante_id, voluntario_id, solicitud_id);

-- 2) Función para actualizar rating de un voluntario
CREATE OR REPLACE FUNCTION actualizar_rating_voluntario()
RETURNS TRIGGER AS $$
DECLARE
nuevo_promedio NUMERIC(3,2);
    nuevo_total INT;
BEGIN
    -- Calcular nuevo promedio y total de valoraciones del voluntario
SELECT
    ROUND(AVG(puntuacion)::numeric, 2),
    COUNT(*)
INTO nuevo_promedio, nuevo_total
FROM valoracion
WHERE voluntario_id = NEW.voluntario_id;

-- Actualizar usuario
UPDATE usuario
SET
    rating_promedio = nuevo_promedio,
    rating_total = nuevo_total
WHERE id = NEW.voluntario_id;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Trigger que se dispara después de INSERT en valoracion
CREATE TRIGGER trigger_actualizar_rating
    AFTER INSERT ON valoracion
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_rating_voluntario();

-- 4) Comentarios
COMMENT ON COLUMN valoracion.solicitante_id IS 'Usuario que hace la valoración (solicitante)';
COMMENT ON COLUMN valoracion.voluntario_id IS 'Usuario valorado (voluntario)';
COMMENT ON FUNCTION actualizar_rating_voluntario IS 'Actualiza rating_promedio y rating_total del voluntario';
COMMENT ON TRIGGER trigger_actualizar_rating ON valoracion IS 'Dispara actualización de rating al crear valoración';