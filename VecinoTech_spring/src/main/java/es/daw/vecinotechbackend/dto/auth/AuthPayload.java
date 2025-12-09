package es.daw.vecinotechbackend.dto.auth;

import es.daw.vecinotechbackend.dto.usuario.UsuarioDTO;

public record AuthPayload(
        String accessToken,
        String refreshToken,
        UsuarioDTO usuario
) {}
