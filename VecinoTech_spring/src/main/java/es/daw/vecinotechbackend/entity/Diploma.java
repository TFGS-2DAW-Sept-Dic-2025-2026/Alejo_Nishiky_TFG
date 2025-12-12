package es.daw.vecinotechbackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad que representa un diploma/certificado de voluntariado
 * Se otorga a voluntarios que hayan completado 50+ ayudas
 */
@Entity
@Table(name = "diploma")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Diploma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "numero_certificado", unique = true, nullable = false, length = 50)
    private String numeroCertificado;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "total_ayudas", nullable = false)
    private Integer totalAyudas;

    @Column(name = "fecha_primera_ayuda")
    private LocalDate fechaPrimeraAyuda;

    @Column(name = "fecha_ultima_ayuda")
    private LocalDate fechaUltimaAyuda;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "emitido_por", length = 100)
    private String emitidoPor;

    @Column(name = "url_publica", length = 500)
    private String urlPublica;

    @Column(name = "codigo_verificacion", unique = true, nullable = false)
    private UUID codigoVerificacion;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "fecha_revocacion")
    private LocalDateTime fechaRevocacion;

    @Column(name = "motivo_revocacion", columnDefinition = "TEXT")
    private String motivoRevocacion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (codigoVerificacion == null) {
            codigoVerificacion = UUID.randomUUID();
        }
        if (activo == null) {
            activo = true;
        }
        if (fechaEmision == null) {
            fechaEmision = LocalDateTime.now();
        }
        if (emitidoPor == null || emitidoPor.isEmpty()) {
            emitidoPor = "VecinoTech Platform";
        }
        if (titulo == null || titulo.isEmpty()) {
            titulo = "Diploma de Voluntariado";
        }
    }
}