-- ============================================
-- V4__add_geolocation_support.sql
-- Añade soporte completo de geolocalización
-- ============================================

-- 1) Añadir campo de ubicación al detalle del usuario
ALTER TABLE usuario_detalle
    ADD COLUMN IF NOT EXISTS ubicacion GEOGRAPHY(Point, 4326);

-- Índice espacial para búsquedas rápidas por ubicación de usuario
CREATE INDEX IF NOT EXISTS idx_usuario_detalle_ubicacion
    ON usuario_detalle USING GIST (ubicacion);

-- 2) Asegurarnos de que solicitud tiene el campo ubicacion con índice
-- (Ya debería existir del schema inicial, pero por si acaso)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'solicitud' AND column_name = 'ubicacion'
    ) THEN
ALTER TABLE solicitud ADD COLUMN ubicacion GEOGRAPHY(Point, 4326);
END IF;
END $$;

-- Índice espacial en solicitud (si no existe ya)
CREATE INDEX IF NOT EXISTS idx_solicitud_ubicacion
    ON solicitud USING GIST (ubicacion);

-- 3) Función auxiliar: calcular distancia entre dos puntos en metros
CREATE OR REPLACE FUNCTION distancia_metros(
    punto1 GEOGRAPHY,
    punto2 GEOGRAPHY
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    IF punto1 IS NULL OR punto2 IS NULL THEN
        RETURN NULL;
END IF;
RETURN ST_Distance(punto1, punto2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4) Vista útil: solicitudes con información de distancia
-- (Ejemplo de cómo podrías usarla en consultas)
CREATE OR REPLACE VIEW v_solicitudes_geolocalizadas AS
SELECT
    s.id,
    s.titulo,
    s.descripcion,
    s.categoria,
    s.estado,
    s.fecha_creacion,
    s.solicitante_id,
    s.voluntario_id,
    ST_Y(s.ubicacion::geometry) as latitud,
    ST_X(s.ubicacion::geometry) as longitud,
    u.nombre as solicitante_nombre,
    u.email as solicitante_email
FROM solicitud s
         JOIN usuario u ON s.solicitante_id = u.id
WHERE s.ubicacion IS NOT NULL;

-- Comentarios útiles
COMMENT ON COLUMN usuario_detalle.ubicacion IS 'Ubicación del usuario para búsquedas de proximidad (WGS84)';
COMMENT ON COLUMN solicitud.ubicacion IS 'Ubicación de la solicitud de ayuda (WGS84)';
COMMENT ON FUNCTION distancia_metros IS 'Calcula distancia en metros entre dos puntos geográficos';