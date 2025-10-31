package es.daw.vecinotechbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;

@Data
public class SolicitudDTO {
    private Long id;
    private Long solicitanteId;
    private String solicitanteNombre;
    private Long voluntarioId;
    private String voluntarioNombre;

    private String titulo;
    private String descripcion;
    private String categoria;
    private String estado; // ABIERTA, EN_PROCESO, CERRADA

    private Instant fechaCreacion;

    // Ubicación en formato simple para el frontend
    private UbicacionDTO ubicacion;

    @Data
    public static class UbicacionDTO {
        private Double latitud;
        private Double longitud;

        public UbicacionDTO() {}

        public UbicacionDTO(Double latitud, Double longitud) {
            this.latitud = latitud;
            this.longitud = longitud;
        }
    }

}

