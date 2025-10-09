package es.daw.vecinotechbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuario", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 72)
    private String passwordHash;

    @Column(name = "fecha_creacion", nullable = false, updatable = false, insertable = false)
    private Instant fechaCreacion;

    @Column(name = "avatar_url", length = 300)
    private String avatarUrl;

    @Column(name = "rating_promedio")
    private Double ratingPromedio = 0.0;

    @Column(name = "rating_total")
    private Integer ratingTotal = 0;

    @Column(nullable = false)
    private boolean activo = false;

    // 1:1 con la tabla "usuario_detalle"
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UsuarioDetalle detalle;

    // Solicitudes creadas por este usuario (solicitante)
    @OneToMany(mappedBy = "solicitante", fetch = FetchType.LAZY)
    private Set<Solicitud> solicitudesCreadas = new HashSet<>();

    // Solicitudes que este usuario tomó como voluntario
    @OneToMany(mappedBy = "voluntario", fetch = FetchType.LAZY)
    private Set<Solicitud> solicitudesTomadas = new HashSet<>();

    // Valoraciones que este usuario HA RECIBIDO (otros me calificaron a mí)
    @OneToMany(mappedBy = "ayudado", fetch = FetchType.LAZY)
    private Set<Valoracion> valoracionesRecibidas = new HashSet<>();

    // Valoraciones que este usuario HA EMITIDO (yo califiqué a otros)
    @OneToMany(mappedBy = "autor", fetch = FetchType.LAZY)
    private Set<Valoracion> valoracionesEmitidas = new HashSet<>();
}
