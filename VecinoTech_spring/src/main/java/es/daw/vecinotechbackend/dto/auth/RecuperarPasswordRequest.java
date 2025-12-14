package es.daw.vecinotechbackend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para solicitar recuperación de contraseña
 */
public record RecuperarPasswordRequest(
        @NotBlank(message = "El email es requerido")
        @Email(message = "El email debe ser válido")
        String email
) {}