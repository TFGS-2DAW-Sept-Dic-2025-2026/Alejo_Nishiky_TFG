package es.daw.vecinotechbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SolicitudDTO {
    private Long id;

    @NotNull
    private Long solicitanteId;

    // Puede ser null si la solicitud está abierta
    private Long voluntarioId;

    @NotBlank @Size(max = 120)
    private String titulo;

    @NotBlank @Size(max = 1000)
    private String descripcion;

    @NotBlank @Size(max = 40)
    private String categoria;

    @NotBlank @Size(max = 20)
    // Valores esperados: "ABIERTA", "EN_PROCESO", "CERRADA"
    private String estado;

    // Geo: lat/lon en WGS84
    // (Usaremos lon/lat en el mapper para crear Point(x=lon, y=lat))
    @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
    private Double lat;

    @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
    private Double lon;

}

