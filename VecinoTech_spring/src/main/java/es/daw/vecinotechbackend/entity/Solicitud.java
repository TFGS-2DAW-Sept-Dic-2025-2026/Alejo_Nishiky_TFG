package es.daw.vecinotechbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.locationtech.jts.geom.Point;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud")
@Data
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quien pide la ayuda
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitante_id",nullable = false)
    private Usuario solicitante;

    // Quien acepta y ayuda (puede ser null si está abierta)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voluntario_id")
    private Usuario voluntario;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String descripcion;

    @Column(nullable = false, length = 40)
    private String categoria;

    @Column(nullable = false, length = 20)
    private String estado; // ABIERTA / EN_PROCESO / CERRADA

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    // GEOGRAPHY(Point,4326) → requiere hibernate-spatial + JTS
    @Column(columnDefinition = "geography(Point,4326)")
    private Point ubicacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (estado == null) {
            estado = "ABIERTA";
        }
    }
}
