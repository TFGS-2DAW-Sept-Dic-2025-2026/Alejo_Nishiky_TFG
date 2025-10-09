package es.daw.vecinotechbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "valoracion")
@Data
public class Valoracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quien valora
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    // Quien recibe la valoración
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ayudado_id", nullable = false)
    private Usuario ayudado;

    // A qué solicitud pertenece la valoración
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitud_id", nullable = false)
    private Solicitud solicitud;

    @Column(name = "puntuacion", nullable = false)
    private Integer puntuacion; // 1..5 (CHECK en DB)

    @Column(length = 500)
    private String comentario;

    @Column(name = "fecha_creacion", nullable = false, updatable = false, insertable = false)
    private Instant fechaCreacion;
}
