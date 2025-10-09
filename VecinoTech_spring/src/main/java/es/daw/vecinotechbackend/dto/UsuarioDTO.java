package es.daw.vecinotechbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UsuarioDTO {
    // Null en create, requerido en update
    private Long id;

    @NotBlank
    @Size(max = 80)
    private String nombre;

    @NotBlank
    @Email
    @Size(max = 120)
    private String email;

    // Para create/update: llega el hash o la contraseña ya hasheada según tu flujo
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 6, max = 72)
    private String password;     // opcional si prefieres enviar "password"

    @Size(max = 72)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String passwordHash; // opcional: permite también "passwordHash"

    @Size(max = 300)
    private String avatarUrl;

    // Solo si permites tocar rating vía admin; si no, quítalos del DTO
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "5.0")
    private Double ratingPromedio;

    @Min(0)
    private Integer ratingTotal;

    private Boolean activo;

    // ===== Campos de detalle que manda tu form =====
    @Size(max = 100) private String telefono;
    @Size(max = 200) private String direccion;
    @Size(max = 100) private String ciudad;
    @Size(max = 100) private String pais;
    @Size(max = 12)  private String codigoPostal;
    @Size(max = 280) private String bio;

}

