package es.daw.vecinotechbackend.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EnviarMensajeRequest {

    @NotBlank(message = "El contenido no puede estar vacío")
    @Size(max = 1000, message = "El mensaje no puede superar 1000 caracteres")
    private String contenido;
}