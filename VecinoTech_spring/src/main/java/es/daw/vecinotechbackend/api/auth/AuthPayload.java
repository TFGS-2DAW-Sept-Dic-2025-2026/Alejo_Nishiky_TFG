package es.daw.vecinotechbackend.api.auth;

import es.daw.vecinotechbackend.dto.UsuarioDTO;

public record AuthPayload(
        String accessToken,
        String refreshToken,
        UsuarioDTO usuario
) {}
