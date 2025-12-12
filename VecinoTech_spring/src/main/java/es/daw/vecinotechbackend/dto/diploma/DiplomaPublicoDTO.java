package es.daw.vecinotechbackend.dto.diploma;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO público del diploma para verificación externa (LinkedIn, etc.)
 * Solo incluye información necesaria para validación pública
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiplomaPublicoDTO {
    private String numeroCertificado;
    private String titulo;
    private String descripcion;
    private String nombreCompleto;
    private Integer totalAyudas;
    private LocalDate fechaPrimeraAyuda;
    private LocalDate fechaUltimaAyuda;
    private LocalDateTime fechaEmision;
    private String emitidoPor;
    private Boolean esValido;
}