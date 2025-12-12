package es.daw.vecinotechbackend.service;

import es.daw.vecinotechbackend.dto.*;
import es.daw.vecinotechbackend.dto.solicitud.ISolicitudMapaDTO;
import es.daw.vecinotechbackend.dto.solicitud.NeedHelpRequest;
import es.daw.vecinotechbackend.dto.usuario.ActualizarPerfilRequest;
import es.daw.vecinotechbackend.dto.usuario.UsuarioDetalleDTO;
import es.daw.vecinotechbackend.dto.valoracion.LeaderDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.UsuarioDetalle;
import es.daw.vecinotechbackend.mapper.UsuarioDetalleMapper;
import es.daw.vecinotechbackend.repository.SolicitudRepository;
import es.daw.vecinotechbackend.repository.UsuarioDetalleRepository;
import es.daw.vecinotechbackend.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.util.List;
/*
======================================== ANOTACIONES ======================================================
* Esta es la capa de servicio. Contiene la lógica de negocio del dominio "/portal" en VecinoTech
* Creo este servicio aparte para no mezcalarla con la parte web (controllers) ni con la persistencia directa
*
*           Controller   ->   Service   ->   Repository
            (API REST)       (Lógica)           (BD)
============================================================================================================
* */

@Service
public class PortalService {
    private final UsuarioRepository usuarioRepository;
    private final SolicitudRepository solicitudRepository;
    private final UsuarioDetalleRepository usuarioDetalleRepository;
    private final GeocodeService geocodeService;
    private final UsuarioDetalleMapper usuarioDetalleMapper;
    private final ChatService chatService;

    public PortalService(UsuarioRepository usuarioRepository,
                         UsuarioDetalleRepository usuarioDetalleRepository,
                         SolicitudRepository solicitudRepository,
                         GeocodeService geocodeService,
                         UsuarioDetalleMapper usuarioDetalleMapper,
                         ChatService chatService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioDetalleRepository = usuarioDetalleRepository;
        this.solicitudRepository = solicitudRepository;
        this.geocodeService = geocodeService;
        this.usuarioDetalleMapper = usuarioDetalleMapper;
        this.chatService = chatService;
    }

    @Transactional
    public boolean toggleVoluntarioEnDetalle(Long userId) {
        Usuario u = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        UsuarioDetalle det = u.getDetalle();
        if (det == null) {
            det = new UsuarioDetalle();
            det.setId(u.getId());
            det.setUsuario(u);
            det.setEsVoluntario(true);
            u.setDetalle(det);
        } else {
            det.setEsVoluntario(!det.isEsVoluntario());
        }
        usuarioRepository.save(u); // cascade persiste el detalle
        return det.isEsVoluntario();
    }

    @Transactional
    public TicketResponse crearSolicitud(Long userId, NeedHelpRequest req) {
        Usuario solicitante = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Solicitud s = new Solicitud();
        s.setSolicitante(solicitante);
        s.setTitulo(req != null && req.asunto() != null ? req.asunto() : "Ayuda en informática");
        s.setDescripcion(req != null && req.descripcion() != null ? req.descripcion() : "Detalle de la ayuda solicitada");
        s.setCategoria(req != null && req.categoria() != null ? req.categoria() : "GENERAL");
        s.setEstado("ABIERTA"); // tu modelo: ABIERTA / EN_PROCESO / CERRADA

        // GEOCODIFICAMOS LA SOLICITUD
        UsuarioDetalle detalle = solicitante.getDetalle();
        Point ubicacion = null;

        if(detalle != null){
            //Intenta usar ubicacion ya guardada del usuario
            ubicacion = detalle.getUbicacion();
            System.out.println("Ubicacion del usuario " + ubicacion.getY() + " - " +  ubicacion.getX());

            // Si no tiene ubicación, geocodificar AHORA
            if (ubicacion == null) {
                System.out.println("Usuario sin ubicación, geocodificando desde dirección...");
                ubicacion = geocodeService.geocodificar(
                        detalle.getDireccion(),
                        detalle.getCiudad(),
                        detalle.getCodigoPostal(),
                        detalle.getPais()
                );

                // Guardar ubicación en el usuario para futuras solicitudes
                if (ubicacion != null) {
                    detalle.setUbicacion(ubicacion);
                    usuarioDetalleRepository.save(detalle);
                    System.out.println("Ubicación geocodificada y guardada en usuario");
                }
            }
        }
        // 3. Asignar ubicación a la solicitud
        if (ubicacion != null) {
            s.setUbicacion(ubicacion);
            System.out.println("✅ Solicitud creada con ubicación");
        } else {
            System.out.println("⚠️ ADVERTENCIA: Solicitud creada SIN ubicación - no aparecerá en el mapa");
        }

        solicitudRepository.save(s);

        String ticket = "VT-" + s.getId();
        return new TicketResponse(ticket);
    }

    @Transactional
    public List<LeaderDTO> getLeaderboard() {
        return solicitudRepository.topVolunteersByClosedRequests()
                .stream()
                .map(p -> new LeaderDTO(p.getNombre(), p.getPoints()))
                .toList();
    }

    // ================== MÉTODOS DE GEOLOCALIZACIÓN ========================

    /**
     * Obtiene solicitudes cercanas a la ubicación del usuario
     */
    public List<Solicitud> obtenerSolicitudesCercanas(Long userId, int radiusKm) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        UsuarioDetalle detalle = usuario.getDetalle();
        if (detalle == null || detalle.getUbicacion() == null) {
            throw new IllegalStateException("El usuario debe configurar su ubicación primero");
        }

        Point ubicacion = detalle.getUbicacion();
        int radiusMetros = radiusKm * 1000;

        return solicitudRepository.findSolicitudesNearby(
                ubicacion.getX(), // longitud
                ubicacion.getY(), // latitud
                radiusMetros,
                50 // máximo 50 resultados
        );
    }

    /**
     * Cuenta solicitudes en el área del usuario
     */
    public long contarSolicitudesCercanas(Long userId, int radiusKm) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        UsuarioDetalle detalle = usuario.getDetalle();
        if (detalle == null || detalle.getUbicacion() == null) {
            return 0;
        }

        Point ubicacion = detalle.getUbicacion();
        int radiusMetros = radiusKm * 1000;

        return solicitudRepository.countSolicitudesNearby(
                ubicacion.getX(),
                ubicacion.getY(),
                radiusMetros
        );
    }

    /**
     * Obtiene todas las solicitudes abiertas para mostrar en mapa
     */
    public List<Solicitud> obtenerTodasSolicitudesAbiertas() {
        return solicitudRepository.findAllAbiertasConUbicacion();
    }

    /**
     * Actualiza la ubicación del usuario geocodificando su dirección
     */
    @Transactional
    public Point actualizarUbicacionUsuario(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        UsuarioDetalle detalle = usuario.getDetalle();
        if (detalle == null) {
            throw new IllegalStateException("El usuario no tiene detalles registrados");
        }

        // Geocodificar usando dirección completa
        Point ubicacion = geocodeService.geocodificar(
                detalle.getDireccion(),
                detalle.getCiudad(),
                detalle.getCodigoPostal(),
                detalle.getPais()
        );

        if (ubicacion != null) {
            detalle.setUbicacion(ubicacion);
            usuarioDetalleRepository.save(detalle);
            return ubicacion;
        } else {
            throw new IllegalStateException("No se pudo geocodificar la dirección proporcionada");
        }
    }

    /**
     * Acepta una solicitud como voluntario
     */
    @Transactional
    public Solicitud aceptarSolicitud(Long solicitudId, Long voluntarioId) {
        // Buscar solicitud
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalStateException("Solicitud no encontrada"));

        // Validar que esté abierta
        if (!"ABIERTA".equals(solicitud.getEstado())) {
            throw new IllegalStateException("Esta solicitud ya fue aceptada o está cerrada");
        }

        // Buscar voluntario
        Usuario voluntario = usuarioRepository.findById(voluntarioId)
                .orElseThrow(() -> new IllegalStateException("Voluntario no encontrado"));

        // Validar que no sea el mismo solicitante
        if (solicitud.getSolicitante().getId().equals(voluntarioId)) {
            throw new SecurityException("No puedes aceptar tu propia solicitud");
        }

        // Asignar voluntario y cambiar estado
        solicitud.setVoluntario(voluntario);
        solicitud.setEstado("EN_PROCESO");

        solicitud = solicitudRepository.save(solicitud);

        // NUEVO: Notificar al solicitante por WebSocket
        chatService.notificarSolicitudAceptada(solicitudId, voluntarioId);

        return solicitud;
    }

    /**
     * Marca una solicitud como completada
     */
    @Transactional
    public Solicitud completarSolicitud(Long solicitudId, Long userId) {
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        // Verificar que el usuario sea el solicitante o el voluntario
        boolean esParticipante = solicitud.getSolicitante().getId().equals(userId) ||
                (solicitud.getVoluntario() != null &&
                        solicitud.getVoluntario().getId().equals(userId));

        if (!esParticipante) {
            throw new SecurityException("No tienes permiso para completar esta solicitud");
        }

        solicitud.setEstado("CERRADA");
        solicitud = solicitudRepository.save(solicitud);

        if (solicitud.getSolicitante().getId().equals(userId)) {
            chatService.notificarChatFinalizado(solicitudId, userId);
        }

        return solicitud;
    }

    // ============== MÉTODOS PARA EL MAPA (FRONTEND) ====================

    /**
     * Obtiene solicitudes para el mapa en formato DTO
     * Ahora incluye ABIERTAS y EN_PROCESO
     */
    public List<ISolicitudMapaDTO> getSolicitudesParaMapa() {
        List<Solicitud> solicitudes = solicitudRepository.findAllAbiertasYEnProcesoConUbicacion();
        return solicitudes.stream()
                .map(this::convertirSolicitudAMapaDTO)
                .toList();
    }

    /**
     * Convierte una entidad Solicitud a DTO para el mapa
     */
    private ISolicitudMapaDTO convertirSolicitudAMapaDTO(Solicitud s) {
        ISolicitudMapaDTO dto = new ISolicitudMapaDTO();
        dto.setId(s.getId());
        dto.setTitulo(s.getTitulo());
        dto.setDescripcion(s.getDescripcion());
        dto.setCategoria(s.getCategoria());
        dto.setEstado(s.getEstado());

        // Fecha en formato ISO 8601
        if (s.getFechaCreacion() != null) {
            dto.setFechaCreacion(s.getFechaCreacion().toString());
        }

        // Ubicación
        if (s.getUbicacion() != null) {
            ISolicitudMapaDTO.UbicacionDTO ubicacion = new ISolicitudMapaDTO.UbicacionDTO();
            ubicacion.setLatitud(s.getUbicacion().getY());  // Y = Latitud
            ubicacion.setLongitud(s.getUbicacion().getX()); // X = Longitud
            dto.setUbicacion(ubicacion);
        }

        // Solicitante
        if (s.getSolicitante() != null) {
            ISolicitudMapaDTO.SolicitanteDTO solicitante = new ISolicitudMapaDTO.SolicitanteDTO();
            solicitante.setId(s.getSolicitante().getId());
            solicitante.setNombre(s.getSolicitante().getNombre());
            dto.setSolicitante(solicitante);
        }
        if (s.getVoluntario() != null) {
            ISolicitudMapaDTO.VoluntarioDTO voluntario = new ISolicitudMapaDTO.VoluntarioDTO();
            voluntario.setId(s.getVoluntario().getId());
            voluntario.setNombre(s.getVoluntario().getNombre());
            dto.setVoluntario(voluntario);
        }

        return dto;
    }

    /**
     * Obtiene todas las solicitudes creadas por un usuario
     */
    public List<Solicitud> obtenerSolicitudesDelUsuario(Long userId) {
        return solicitudRepository.findBySolicitanteId(userId);
    }

    /**
     * Obtiene las solicitudes donde el usuario es voluntario
     */
    public List<Solicitud> obtenerSolicitudesComoVoluntario(Long userId) {
        return solicitudRepository.findByVoluntarioId(userId);
    }

    /**
     * Actualiza los datos del perfil del usuario
     * Geocodifica automáticamente si cambia dirección o CP
     */
    @Transactional
    public UsuarioDetalleDTO actualizarPerfil(Long userId, ActualizarPerfilRequest request) {

        // Buscar usuario
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        // ========== ACTUALIZAR TABLA USUARIO ==========
        usuario.setNombre(request.getNombre());

        // Solo actualizar avatar si viene en el request
        if (request.getAvatarUrl() != null) {
            usuario.setAvatarUrl(request.getAvatarUrl());
        }

        // ========== ACTUALIZAR TABLA USUARIO_DETALLE ==========
        UsuarioDetalle detalle = usuario.getDetalle();
        if (detalle == null) {
            // Crear detalle si no existe (primera vez)
            detalle = new UsuarioDetalle();
            detalle.setUsuario(usuario);
            usuario.setDetalle(detalle);
        }

        // ✅ NUEVO: Guardar valores anteriores para comparar
        String direccionAnterior = detalle.getDireccion();
        String codigoPostalAnterior = detalle.getCodigoPostal();

        // Actualizar campos de detalle
        detalle.setTelefono(request.getTelefono());
        detalle.setDireccion(request.getDireccion());
        detalle.setCodigoPostal(request.getCodigoPostal());

        // ========== DETECTAR SI CAMBIÓ LA UBICACIÓN ==========
        boolean direccionCambio = false;
        StringBuilder cambiosLog = new StringBuilder();

        // Verificar cambio en dirección
        if (request.getDireccion() != null && !request.getDireccion().isBlank()) {
            if (direccionAnterior == null || !request.getDireccion().equals(direccionAnterior)) {
                direccionCambio = true;
                cambiosLog.append(String.format(
                        "Dirección: '%s' → '%s'",
                        direccionAnterior != null ? direccionAnterior : "(vacío)",
                        request.getDireccion()
                ));
            }
        }

        //  Verificar cambio en código postal (con null-safe)
        if (request.getCodigoPostal() != null && !request.getCodigoPostal().isBlank()) {
            boolean cpCambio = codigoPostalAnterior == null ||
                    !request.getCodigoPostal().equals(codigoPostalAnterior);

            if (cpCambio) {
                direccionCambio = true;
                if (cambiosLog.length() > 0) cambiosLog.append(", ");
                cambiosLog.append(String.format(
                        "CP: '%s' → '%s'",
                        codigoPostalAnterior != null ? codigoPostalAnterior : "(vacío)",
                        request.getCodigoPostal()
                ));
            }
        }

        // ========== GUARDAR CAMBIOS PRIMERO ==========
        usuarioRepository.save(usuario);

        // ========== GEOCODIFICAR SI CAMBIÓ ==========
        if (direccionCambio) {
            System.out.println("🗺️ Cambios detectados en ubicación para usuario #" + userId);
            System.out.println("   " + cambiosLog.toString());
            System.out.println("   Iniciando geocodificación automática...");

            try {
                // Reutilizar el método existente
                Point ubicacion = actualizarUbicacionUsuario(userId);

                System.out.println(String.format(
                        "   ✅ Geocodificación exitosa: [lat=%.6f, lng=%.6f]",
                        ubicacion.getY(),
                        ubicacion.getX()
                ));

            } catch (IllegalStateException e) {
                //Limpiar ubicación anterior si la nueva dirección no se geocodifica
                // detalle.setUbicacion(null);
                // usuarioDetalleRepository.save(detalle);

            } catch (Exception e) {
                // Error inesperado (red, timeout, etc.)
                System.err.println("Error geocodificando: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("ℹ️ Usuario #" + userId + " - Perfil actualizado sin cambios en ubicación");
        }

        // ========== RETORNAR DTO ACTUALIZADO ==========
        return usuarioDetalleMapper.toDTO(detalle);
    }

    /**
     * Actualiza solo el avatar del usuario
     */
    @Transactional
    public void actualizarAvatar(Long userId, String avatarUrl) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        usuario.setAvatarUrl(avatarUrl);
        usuarioRepository.save(usuario);
    }
}
