package es.daw.vecinotechbackend.dto.usuario;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioDetalleDTO {
    // En 1:1 utilizamos el mismo id del usuario
    private Long id;

    @Size(max = 100)
    private String telefono;

    @Size(max = 200)
    private String direccion;

    @Size(max = 100)
    private String ciudad;

    @Size(max = 100)
    private String pais;

    @Size(max = 12)
    private String codigoPostal;

    @Size(max = 280)
    private String bio;

    private boolean esVoluntario;

}

