package es.daw.vecinotechbackend.service;

import es.daw.vecinotechbackend.dto.LeaderDTO;
import es.daw.vecinotechbackend.dto.NeedHelpRequest;
import es.daw.vecinotechbackend.dto.TicketResponse;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.UsuarioDetalle;
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

    public PortalService(UsuarioRepository usuarioRepository,
                         UsuarioDetalleRepository usuarioDetalleRepository,
                         SolicitudRepository solicitudRepository,
                         GeocodeService geocodeService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioDetalleRepository = usuarioDetalleRepository;
        this.solicitudRepository = solicitudRepository;
        this.geocodeService = geocodeService;

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
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        // Verificar que esté abierta
        if (!solicitud.getEstado().equals("ABIERTA")) {
            throw new IllegalStateException("Esta solicitud ya no está disponible");
        }

        // Verificar que no tenga voluntario ya
        if (solicitud.getVoluntario() != null) {
            throw new IllegalStateException("Esta solicitud ya fue aceptada por otro voluntario");
        }

        Usuario voluntario = usuarioRepository.findById(voluntarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Verificar que sea voluntario activo
        UsuarioDetalle detalle = voluntario.getDetalle();
        if (detalle == null || !detalle.isEsVoluntario()) {
            throw new IllegalStateException("Debes activar el modo voluntario primero");
        }

        solicitud.setVoluntario(voluntario);
        solicitud.setEstado("EN_PROCESO");

        return solicitudRepository.save(solicitud);
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
        return solicitudRepository.save(solicitud);
    }
}
