package es.daw.vecinotechbackend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MensajeDTO {
    private Long id;
    private Long solicitudId;
    private Long remitenteId;
    private String remitenteNombre;
    private String contenido;
    private LocalDateTime fechaEnvio;
    private boolean leido;
}
