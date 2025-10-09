package es.daw.vecinotechbackend.entity;

import jakarta.persistence.*;
import lombok.Data;


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
}
