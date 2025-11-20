package es.daw.vecinotechbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarPerfilRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 80, message = "El nombre debe tener entre 3 y 80 caracteres")
    private String nombre;

    @Size(max = 300, message = "La URL del avatar no puede superar 300 caracteres")
    private String avatarUrl;

    @Pattern(regexp = "^[0-9]{9}$", message = "El teléfono debe tener 9 dígitos")
    private String telefono;

    @Size(min = 5, max = 200, message = "La dirección debe tener entre 5 y 200 caracteres")
    private String direccion;

    @Pattern(regexp = "^[0-9]{5}$", message = "El código postal debe tener 5 dígitos")
    private String codigoPostal;
}
