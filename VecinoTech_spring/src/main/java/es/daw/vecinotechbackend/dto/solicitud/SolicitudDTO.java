package es.daw.vecinotechbackend.dto.solicitud;

import lombok.Data;

import java.time.LocalDateTime;

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

    private LocalDateTime fechaCreacion;

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

