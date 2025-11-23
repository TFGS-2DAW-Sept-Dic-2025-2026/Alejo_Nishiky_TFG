-- ============================================
-- V6__add_chat_messages.sql
-- Añade tabla de mensajes para chat
-- ============================================

CREATE TABLE mensaje (
                         id BIGSERIAL PRIMARY KEY,
                         solicitud_id BIGINT NOT NULL,
                         remitente_id BIGINT NOT NULL,
                         contenido VARCHAR(1000) NOT NULL,
                         fecha_envio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                         leido BOOLEAN DEFAULT FALSE,

                         CONSTRAINT fk_mensaje_solicitud
                             FOREIGN KEY (solicitud_id) REFERENCES solicitud (id) ON DELETE CASCADE,
                         CONSTRAINT fk_mensaje_remitente
                             FOREIGN KEY (remitente_id) REFERENCES usuario (id) ON DELETE CASCADE
);

-- Índices para rendimiento
CREATE INDEX idx_mensaje_solicitud ON mensaje (solicitud_id);
CREATE INDEX idx_mensaje_fecha ON mensaje (fecha_envio DESC);
CREATE INDEX idx_mensaje_leido ON mensaje (leido) WHERE leido = false;

COMMENT ON TABLE mensaje IS 'Mensajes del chat entre solicitante y voluntario';
COMMENT ON COLUMN mensaje.solicitud_id IS 'Solicitud a la que pertenece el chat';
COMMENT ON COLUMN mensaje.remitente_id IS 'Usuario que envió el mensaje';
COMMENT ON COLUMN mensaje.contenido IS 'Texto del mensaje (máx 1000 caracteres)';
COMMENT ON COLUMN mensaje.leido IS 'Si el destinatario ha leído el mensaje';