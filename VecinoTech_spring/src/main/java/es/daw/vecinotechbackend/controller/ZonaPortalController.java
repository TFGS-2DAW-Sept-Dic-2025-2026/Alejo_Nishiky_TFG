package es.daw.vecinotechbackend.controller;

import es.daw.vecinotechbackend.dto.ApiResponse;
import es.daw.vecinotechbackend.dto.*;
import es.daw.vecinotechbackend.dto.solicitud.ISolicitudMapaDTO;
import es.daw.vecinotechbackend.dto.solicitud.NeedHelpRequest;
import es.daw.vecinotechbackend.dto.solicitud.SolicitudDTO;
import es.daw.vecinotechbackend.dto.usuario.ActualizarPerfilRequest;
import es.daw.vecinotechbackend.dto.usuario.UsuarioDetalleDTO;
import es.daw.vecinotechbackend.dto.valoracion.LeaderDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.mapper.SolicitudMapper;
import es.daw.vecinotechbackend.service.FileStorageService;
import es.daw.vecinotechbackend.service.PortalService;
import jakarta.validation.Valid;
import org.locationtech.jts.geom.Point;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portal")
public class ZonaPortalController {

    private final PortalService portalService;
    private final SolicitudMapper solicitudMapper;
    private final FileStorageService fileStorageService;

    public ZonaPortalController(PortalService portalService, SolicitudMapper solicitudMapper, FileStorageService fileStorageService) {
        this.portalService = portalService;
        this.solicitudMapper = solicitudMapper;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/volunteer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleVolunteer() {
        Long userId = getCurrentUserId();
        boolean activo = portalService.toggleVoluntarioEnDetalle(userId);

        return ResponseEntity.ok(
                ApiResponse.ok("Voluntariado " + (activo ? "activado" : "desactivado"),
                        Map.of("ok", true, "role", activo ? "VOLUNTARIO" : "NINGUNO"))
        );
    }

    @PostMapping("/need-help")
    public ResponseEntity<ApiResponse<TicketResponse>> needHelp(
            @RequestBody(required = false) NeedHelpRequest req) {
        Long userId = getCurrentUserId();
        TicketResponse ticket = portalService.crearSolicitud(userId, req);
        return ResponseEntity.ok(ApiResponse.ok("Solicitud creada", ticket));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderDTO>>> leaderboard() {
        List<LeaderDTO> leaders = portalService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.ok(leaders));
    }

    // ================ METODO DE AYUDA ============
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }

    // ============= NUEVOS ENDPOINTS DE GEOLOCALIZACIÓN =============

    /**
     * Obtiene solicitudes cercanas a la ubicación del usuario
     * @param radius Radio de búsqueda en kilómetros (por defecto 5km)
     */
    @GetMapping("/solicitudes/cercanas")
    public ResponseEntity<ApiResponse<List<SolicitudDTO>>> solicitudesCercanas(
            @RequestParam(defaultValue = "5") int radius) {

        try {
            Long userId = getCurrentUserId();

            // Validar radio (máximo 20km como indicaste)
            if (radius < 1) radius = 1;
            if (radius > 20) radius = 20;

            List<Solicitud> solicitudes = portalService.obtenerSolicitudesCercanas(userId, radius);

            List<SolicitudDTO> dtos = solicitudes.stream()
                    .map(solicitudMapper::toDTO)
                    .toList();

            return ResponseEntity.ok(
                    ApiResponse.ok(
                            String.format("Encontradas %d solicitudes en un radio de %d km",
                                    dtos.size(), radius),
                            dtos
                    )
            );

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Cuenta solicitudes en el área del usuario
     */
    @GetMapping("/solicitudes/contar-cercanas")
    public ResponseEntity<ApiResponse<Map<String, Object>>> contarSolicitudesCercanas(
            @RequestParam(defaultValue = "5") int radius) {

        Long userId = getCurrentUserId();
        long count = portalService.contarSolicitudesCercanas(userId, radius);

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Solicitudes contadas",
                        Map.of(
                                "count", count,
                                "radius_km", radius
                        )
                )
        );
    }

    /**
     * Obtiene TODAS las solicitudes abiertas (para pintar en mapa)
     * Sin filtro de distancia - muestra todo
     */
    @GetMapping("/solicitudes/mapa")
    public ResponseEntity<ApiResponse<List<ISolicitudMapaDTO>>> solicitudesParaMapa() {
        List<Solicitud> solicitudes = portalService.obtenerTodasSolicitudesAbiertas();

        List<ISolicitudMapaDTO> dtos = solicitudes.stream()
                .map(solicitudMapper::toMapaDTO)
                .toList();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        String.format("Mostrando %d solicitudes abiertas", dtos.size()),
                        dtos
                )
        );
    }

    /**
     * Actualiza la ubicación del usuario geocodificando su dirección
     */
    @PostMapping("/ubicacion/actualizar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> actualizarUbicacion() {
        try {
            Long userId = getCurrentUserId();
            Point ubicacion = portalService.actualizarUbicacionUsuario(userId);

            return ResponseEntity.ok(
                    ApiResponse.ok(
                            "Ubicación actualizada correctamente",
                            Map.of(
                                    "latitud", ubicacion.getY(),
                                    "longitud", ubicacion.getX()
                            )
                    )
            );

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Acepta una solicitud como voluntario
     */
    @PostMapping("/solicitudes/{id}/aceptar")
    public ResponseEntity<ApiResponse<SolicitudDTO>> aceptarSolicitud(
            @PathVariable Long id) {

        try {
            Long userId = getCurrentUserId();
            Solicitud solicitud = portalService.aceptarSolicitud(id, userId);
            SolicitudDTO dto = solicitudMapper.toDTO(solicitud);

            return ResponseEntity.ok(
                    ApiResponse.ok("Solicitud aceptada. ¡Prepárate para ayudar!", dto)
            );

        } catch (IllegalStateException | SecurityException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Marca una solicitud como completada
     */
    @PostMapping("/solicitudes/{id}/completar")
    public ResponseEntity<ApiResponse<SolicitudDTO>> completarSolicitud(
            @PathVariable Long id) {

        try {
            Long userId = getCurrentUserId();
            Solicitud solicitud = portalService.completarSolicitud(id, userId);
            SolicitudDTO dto = solicitudMapper.toDTO(solicitud);

            return ResponseEntity.ok(
                    ApiResponse.ok("¡Solicitud completada! Gracias por ayudar.", dto)
            );

        } catch (SecurityException e) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(403, e.getMessage()));
        }
    }

    /**
     * Obtiene las solicitudes creadas por el usuario autenticado
     * GET /api/portal/mis-solicitudes
     */
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<ApiResponse<List<ISolicitudMapaDTO>>> getMisSolicitudes() {
        try {
            Long userId = getCurrentUserId();

            // Buscar solicitudes del usuario ordenadas por fecha descendente
            List<Solicitud> solicitudes = portalService.obtenerSolicitudesDelUsuario(userId);

            // Mapear a DTO
            List<ISolicitudMapaDTO> solicitudesDTO = solicitudes.stream()
                    .map(solicitudMapper::toMapaDTO)
                    .toList();

            return ResponseEntity.ok(
                    ApiResponse.ok(
                            String.format("Mostrando %d solicitudes tuyas", solicitudesDTO.size()),
                            solicitudesDTO
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, "Error al obtener tus solicitudes: " + e.getMessage()));
        }
    }

    /**
     * Obtiene las solicitudes donde el usuario autenticado es el voluntario
     * GET /api/portal/solicitudes/voluntario
     */
    @GetMapping("/solicitudes/voluntario")
    public ResponseEntity<ApiResponse<List<ISolicitudMapaDTO>>> getSolicitudesComoVoluntario() {
        try {
            Long userId = getCurrentUserId();

            // Buscar solicitudes donde el usuario es voluntario
            List<Solicitud> solicitudes = portalService.obtenerSolicitudesComoVoluntario(userId);

            // Mapear a DTO
            List<ISolicitudMapaDTO> solicitudesDTO = solicitudes.stream()
                    .map(solicitudMapper::toMapaDTO)
                    .toList();

            return ResponseEntity.ok(
                    ApiResponse.ok(
                            String.format("Mostrando %d solicitudes que has aceptado", solicitudesDTO.size()),
                            solicitudesDTO
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, "Error al obtener solicitudes: " + e.getMessage()));
        }
    }

    /**
     * Completa/cierra una solicitud (cambio de POST a PUT)
     * PUT /api/portal/solicitudes/{id}/completar
     */
    @PutMapping("/solicitudes/{id}/completar")
    public ResponseEntity<ApiResponse<SolicitudDTO>> completarSolicitudPUT(
            @PathVariable Long id) {
        // Reutiliza el método existente
        return completarSolicitud(id);
    }

    /**
     * Actualiza el perfil del usuario autenticado
     * PUT /api/portal/perfil
     */
    @PutMapping("/perfil")
    public ResponseEntity<ApiResponse<UsuarioDetalleDTO>> actualizarPerfil(
            @Valid @RequestBody ActualizarPerfilRequest request) {

        try {
            Long userId = getCurrentUserId();
            UsuarioDetalleDTO detalle = portalService.actualizarPerfil(userId, request);

            return ResponseEntity.ok(
                    ApiResponse.ok("Perfil actualizado correctamente", detalle)
            );

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Sube una imagen de avatar
     * POST /api/portal/perfil/avatar
     */
    @PostMapping("/perfil/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> subirAvatar(
            @RequestParam("file") MultipartFile file) {

        try {
            Long userId = getCurrentUserId();

            // Guardar archivo y obtener URL
            String avatarUrl = fileStorageService.guardarAvatar(file, userId);

            // Actualizar avatar en BD
            portalService.actualizarAvatar(userId, avatarUrl);

            return ResponseEntity.ok(
                    ApiResponse.ok(
                            "Avatar actualizado correctamente",
                            Map.of("avatarUrl", avatarUrl)
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error(500, "Error al subir el avatar"));
        }
    }

}
