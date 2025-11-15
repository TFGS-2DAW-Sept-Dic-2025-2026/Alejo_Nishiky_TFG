package es.daw.vecinotechbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ISolicitudMapaDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private String categoria;
    private String estado;
    private UbicacionDTO ubicacion;
    private SolicitanteDTO solicitante;
    private String fechaCreacion; // ISO 8601: "2025-10-25T18:01:41"

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UbicacionDTO {
        private Double latitud;
        private Double longitud;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SolicitanteDTO {
        private Long id;
        private String nombre;
    }
}
