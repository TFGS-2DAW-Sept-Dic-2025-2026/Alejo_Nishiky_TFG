package es.daw.vecinotechbackend.controller;

import com.mailjet.client.errors.MailjetException;
import es.daw.vecinotechbackend.api.ApiResponse;
import es.daw.vecinotechbackend.api.auth.AuthPayload;
import es.daw.vecinotechbackend.api.auth.AuthRequest;
import es.daw.vecinotechbackend.api.auth.RefreshRequest;
import es.daw.vecinotechbackend.dto.UsuarioDTO;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.mapper.UsuarioMapper;
import es.daw.vecinotechbackend.repository.UsuarioDetalleRepository;
import es.daw.vecinotechbackend.repository.UsuarioRepository;
import es.daw.vecinotechbackend.service.MailService;
import es.daw.vecinotechbackend.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@RestController
@RequestMapping("/api/zonaUsuario")
public class ZonaUsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioDetalleRepository usuarioDetalleRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final JwtUtils jwtUtils;


    @Value("${app.frontend.base-url}")
    private String frontBaseUrl;

    @Value("${app.backend.base-url}")
    private String backendBaseUrl;

    public ZonaUsuarioController(UsuarioRepository usuarioRepository,
                                 UsuarioMapper usuarioMapper,
                                 PasswordEncoder passwordEncoder,
                                 MailService mailService,
                                 JwtUtils jwtUtils,
                                 UsuarioDetalleRepository usuarioDetalleRepository) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
        this.jwtUtils = jwtUtils;
        this.usuarioDetalleRepository = usuarioDetalleRepository;
    }

    // ============= REGISTRO DE USUARIO ==========
    @PostMapping("/registro")
    public ResponseEntity<ApiResponse<UsuarioDTO>> registrar(@Valid @RequestBody UsuarioDTO dto) {
        System.out.println("=========== ESTAS EN EL REGISTRO MACHOOOOOOOOOOOOO =========");
        String email = dto.getEmail().trim().toLowerCase();

        if (usuarioRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409) // CONFLICT
                    .body(ApiResponse.error(1, "El email ya está registrado"));
        }

        String rawPwd = dto.getPassword() != null ? dto.getPassword() : dto.getPasswordHash();
        if (rawPwd == null || rawPwd.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(1, "El campo password es requerido"));
        }

        Usuario entity = usuarioMapper.toEntity(dto);
        entity.setEmail(email);
        entity.setPasswordHash(passwordEncoder.encode(rawPwd));
        entity.setActivo(false);

        Usuario saved = usuarioRepository.save(entity);

        // Generar token de activación (24h)
        String token = jwtUtils.createActivationToken(saved.getId(), saved.getEmail(), 86400);
        String activarUrl = backendBaseUrl + "/api/zonaUsuario/activar?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);

        // Enviar correo
        try {
            String nombre = saved.getNombre() != null ? saved.getNombre() : saved.getEmail();
            mailService.enviarActivacion(saved.getEmail(), nombre, activarUrl);
        } catch (MailjetException e) {
            // Si falla el envío, puedes decidir revertir el usuario o permitir reenvío
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(2001, "No se pudo enviar el correo de activación."));
        }

        // No devolvemos el usuario por seguridad
        return ResponseEntity.ok(ApiResponse.ok("Registro recibido. Revisa tu email para activar tu cuenta.", null));
    }

    // ============== ACTIVACIÓN VIA ENLACE ==============
    @GetMapping("/activar")
    public RedirectView activarCuenta(@RequestParam("token") String token) {
        // URLs para redireccionar al front!
        String destinoOk = frontBaseUrl + "/Usuario/Activar?status=ok";
        String destinoError = frontBaseUrl + "/Usuario/Activar?status=error";

        try {
            // Valida firma, issuer, exp y QUE sea de propósito 'account_activation'
            Claims claims = jwtUtils.validateAndRequirePurpose(token, "account_activation");

            Long uid = jwtUtils.extractUserId(claims); // o claims.get("uid", Long.class)
            if (uid == null) {
                return new RedirectView(destinoError);
            }

            Optional<Usuario> opt = usuarioRepository.findById(uid);
            if (opt.isEmpty()) {
                return new RedirectView(destinoError);
            }

            Usuario u = opt.get();

            // si ya estaba activo, no pasa nada: igual redirige a OK!
            if (Boolean.TRUE.equals(u.isActivo())) {
                return new RedirectView(destinoOk);
            }

            // Aqui activo el usuario!
            u.setActivo(true);
            usuarioRepository.save(u);

            return new RedirectView(destinoOk);

        } catch (Exception ex) {
            return new RedirectView(destinoError);
        }
    }


    // ============== LOGIN DE USUARIO ==================
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthPayload>> login(@Valid @RequestBody AuthRequest req) {
        String email = req.email().trim().toLowerCase();

        var opt = usuarioRepository.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(401).body(ApiResponse.error(1, "Usuario no encontrado"));
        }
        var usuario = opt.get();

        if (!passwordEncoder.matches(req.password(), usuario.getPasswordHash())) {
            return ResponseEntity.status(401).body(ApiResponse.error(1, "Credenciales inválidas"));
        }
        if (!usuario.isActivo()) {
            return ResponseEntity.status(403).body(ApiResponse.error(2, "Cuenta no activada"));
        }

        // Emite tokens
        String access  = jwtUtils.createAccessToken(usuario.getId()); // ← sin rol
        String refresh = jwtUtils.createRefreshToken(usuario.getId());
        var dto = usuarioMapper.toDTO(usuario);
        var payload = new AuthPayload(access, refresh, dto);
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", payload));
    }


    // ==================== REENVIO PARA ACTIVACION =====================
    /**
     * Reenvía el correo de activación si la cuenta existe y no está activada.
     * Siempre responde de forma neutra para no revelar si el email existe.
     */
    @PostMapping("/reenvio-activacion")
    public ResponseEntity<ApiResponse<Void>> reenvioActivacion(@RequestBody UsuarioDTO dto) {
        // 1.- Validación básica del email
        String email = (dto.getEmail() == null) ? null : dto.getEmail().trim().toLowerCase();
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(1006, "Email requerido"));
        }

        // 2) Buscar usuario (respuesta neutra si no existe)
        Optional<Usuario> opt = usuarioRepository.findByEmail(email);
        if (opt.isEmpty()) {
            // Respuesta neutra (no revelamos existencia)
            return ResponseEntity.ok(ApiResponse.ok("Si el email existe, hemos reenviado la activación.", null));
        }

        Usuario u = opt.get();

        // 3) Si ya está activo, mensaje claro (no es sensible)
        if (Boolean.TRUE.equals(u.isActivo())) {
            return ResponseEntity.ok(ApiResponse.ok("La cuenta ya está activada.", null));
        }

        // 4) Generar nuevo token y enviar correo
        try {
            String token = jwtUtils.createActivationToken(u.getId(), u.getEmail(), 86400); // 24h
            String activarUrl = backendBaseUrl + "/api/zonaUsuario/activar?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);

            String nombre = (u.getNombre() != null && !u.getNombre().isBlank()) ? u.getNombre() : u.getEmail();
            mailService.enviarActivacion(u.getEmail(), nombre, activarUrl);

            // Respuesta neutra
            return ResponseEntity.ok(ApiResponse.ok("Si el email existe, hemos reenviado la activación.", null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(2001, "No se pudo enviar el correo de activación."));
        }
    }

    // ========================= REFRESH TOKENS ==========================
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthPayload>> refresh(@RequestBody RefreshRequest body) {
        Long userId = jwtUtils.validateRefreshAndGetUserId(body.refreshToken());
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(1, "Refresh token inválido"));
        }

        var user = usuarioRepository.findById(userId).orElse(null);
        if (user == null || !user.isActivo()) {
            return ResponseEntity.status(401).body(ApiResponse.error(1, "Usuario inválido o inactivo"));
        }

        String newAccess = jwtUtils.createAccessToken(user.getId()); // ← sin rol
        var dto = usuarioMapper.toDTO(user);
        var payload = new AuthPayload(newAccess, body.refreshToken(), dto);
        return ResponseEntity.ok(ApiResponse.ok("OK", payload));
    }

}
