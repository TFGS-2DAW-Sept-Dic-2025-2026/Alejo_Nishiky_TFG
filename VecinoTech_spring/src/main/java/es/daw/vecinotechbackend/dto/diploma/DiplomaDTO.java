package es.daw.vecinotechbackend.dto.diploma;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO completo del diploma para el usuario propietario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiplomaDTO {
    private Long id;
    private String numeroCertificado;
    private String titulo;
    private String descripcion;

    // Info del voluntario
    private String nombreCompleto;
    private String emailVoluntario;

    // Estadísticas
    private Integer totalAyudas;
    private LocalDate fechaPrimeraAyuda;
    private LocalDate fechaUltimaAyuda;

    // Emisión
    private LocalDateTime fechaEmision;
    private String emitidoPor;

    // Verificación pública
    private String urlPublica;
    private UUID codigoVerificacion;

    // Estado
    private Boolean activo;
}