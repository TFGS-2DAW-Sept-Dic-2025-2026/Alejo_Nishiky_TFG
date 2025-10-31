package es.daw.vecinotechbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.locationtech.jts.geom.Point;


@Entity
@Table(name = "usuario_detalle")
@Data
public class UsuarioDetalle {

    @Id
    @Column(name = "usuario_id")
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(length = 100)
    private String telefono;

    @Column(length = 200)
    private String direccion;

    @Column(length = 100)
    private String ciudad;

    @Column(length = 100)
    private String pais;

    @Column(name = "codigo_postal", length = 12)
    private String codigoPostal;

    @Column(length = 280)
    private String bio;

    @Column(name = "es_voluntario", nullable = false)
    private boolean esVoluntario = false;

    //Esto es para la ubicación geografica (WGS84)
    @Column(columnDefinition = "geography(Point,4326)")
    private Point ubicacion;
}
