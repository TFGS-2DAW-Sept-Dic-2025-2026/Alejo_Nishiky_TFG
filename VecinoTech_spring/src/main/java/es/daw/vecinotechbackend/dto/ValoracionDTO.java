package es.daw.vecinotechbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ValoracionDTO {
    private Long id;

    @NotNull
    private Long autorId;

    @NotNull
    private Long ayudadoId;

    @NotNull
    private Long solicitudId;

    @NotNull
    @Min(1) @Max(5)
    private Integer puntuacion;

    @Size(max = 500)
    private String comentario;

}

