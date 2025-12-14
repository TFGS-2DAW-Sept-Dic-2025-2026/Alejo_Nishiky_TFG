package es.daw.vecinotechbackend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para restablecer la contraseña usando el token recibido por correo
 */
public record RestablecerPasswordRequest(
        @NotBlank(message = "El token es requerido")
        String token,

        @NotBlank(message = "La nueva contraseña es requerida")
        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
        String nuevaPassword
) {}