package es.daw.vecinotechbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatNotificacionDTO {
    private String tipo; // "solicitud-aceptada", "usuario-conectado", "nuevo-mensaje"
    private Long solicitudId;
    private Long usuarioId;
    private String usuarioNombre;
    private MensajeDTO mensaje; // Solo si tipo = "nuevo-mensaje"
}