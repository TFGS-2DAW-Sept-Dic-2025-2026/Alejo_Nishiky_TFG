-- ==================== MIGRACIÓN V8: Sistema de Diplomas ====================
-- Fecha: 11/2025
-- Descripción: Crea tabla para diplomas/certificados de voluntarios destacados
-- ==================== TABLA: diploma ====================
CREATE TABLE diploma (
                         id BIGSERIAL PRIMARY KEY,
                         usuario_id BIGINT NOT NULL,

    -- Información del diploma
                         numero_certificado VARCHAR(50) UNIQUE NOT NULL,
                         titulo VARCHAR(200) NOT NULL DEFAULT 'Diploma de Voluntariado',
                         descripcion TEXT,

    -- Estadísticas al momento de generación
                         total_ayudas INTEGER NOT NULL,
                         fecha_primera_ayuda DATE,
                         fecha_ultima_ayuda DATE,

    -- Control de emisión
                         fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         emitido_por VARCHAR(100) DEFAULT 'VecinoTech Platform',

    -- URL pública del diploma
                         url_publica VARCHAR(500),
                         codigo_verificacion UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

    -- Estado y validez
                         activo BOOLEAN DEFAULT true,
                         fecha_revocacion TIMESTAMP,
                         motivo_revocacion TEXT,

    -- Auditoría
                         fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
                         CONSTRAINT fk_diploma_usuario FOREIGN KEY (usuario_id)
                             REFERENCES usuario(id) ON DELETE CASCADE,

    -- Constraints
                         CONSTRAINT chk_total_ayudas CHECK (total_ayudas >= 50)
);

-- ==================== ÍNDICES ====================
CREATE INDEX idx_diploma_usuario_id ON diploma(usuario_id);
CREATE INDEX idx_diploma_codigo_verificacion ON diploma(codigo_verificacion);
CREATE INDEX idx_diploma_numero_certificado ON diploma(numero_certificado);
CREATE INDEX idx_diploma_activo ON diploma(activo) WHERE activo = true;

-- ==================== COMENTARIOS ====================
COMMENT ON TABLE diploma IS 'Almacena los diplomas/certificados otorgados a voluntarios destacados (50+ ayudas)';
COMMENT ON COLUMN diploma.numero_certificado IS 'Número único del certificado visible en el diploma (Ej: VTCH-2025-00001)';
COMMENT ON COLUMN diploma.codigo_verificacion IS 'UUID para verificación pública del diploma';
COMMENT ON COLUMN diploma.url_publica IS 'URL pública compartible del diploma (para LinkedIn)';
COMMENT ON COLUMN diploma.total_ayudas IS 'Número de ayudas completadas al momento de generar el diploma';
COMMENT ON COLUMN diploma.activo IS 'Indica si el diploma es válido o ha sido revocado';