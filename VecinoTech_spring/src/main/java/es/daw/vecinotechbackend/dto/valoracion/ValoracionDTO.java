package es.daw.vecinotechbackend.dto.valoracion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime; 

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValoracionDTO {
    private Long id;

    private Long solicitanteId;
    private String solicitanteNombre;

    private Long voluntarioId;
    private String voluntarioNombre;

    private Long solicitudId;
    private Integer puntuacion; // 1-5
    private String comentario;
    private LocalDateTime fechaCreacion;
}