package es.daw.vecinotechbackend.service;

import es.daw.vecinotechbackend.dto.chat.ChatNotificacionDTO;
import es.daw.vecinotechbackend.dto.chat.MensajeDTO;
import es.daw.vecinotechbackend.dto.VideoCallInviteDTO;
import es.daw.vecinotechbackend.entity.Mensaje;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.mapper.MensajeMapper;
import es.daw.vecinotechbackend.repository.MensajeRepository;
import es.daw.vecinotechbackend.repository.SolicitudRepository;
import es.daw.vecinotechbackend.repository.UsuarioRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final MensajeRepository mensajeRepository;
    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final MensajeMapper mensajeMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(MensajeRepository mensajeRepository,
                       SolicitudRepository solicitudRepository,
                       UsuarioRepository usuarioRepository,
                       MensajeMapper mensajeMapper,
                       SimpMessagingTemplate messagingTemplate) {
        this.mensajeRepository = mensajeRepository;
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.mensajeMapper = mensajeMapper;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Envía un mensaje en el chat
     */
    @Transactional
    public MensajeDTO enviarMensaje(Long solicitudId, Long remitenteId, String contenido) {

        // Validar solicitud
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalStateException("Solicitud no encontrada"));

        // Validar que la solicitud esté EN_PROCESO
        if (!"EN_PROCESO".equals(solicitud.getEstado())) {
            throw new IllegalStateException("Solo se puede chatear en solicitudes en proceso");
        }

        // Validar usuario
        Usuario remitente = usuarioRepository.findById(remitenteId)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        // Validar que el usuario sea parte de la solicitud
        boolean esParticipante = solicitud.getSolicitante().getId().equals(remitenteId) ||
                (solicitud.getVoluntario() != null &&
                        solicitud.getVoluntario().getId().equals(remitenteId));

        if (!esParticipante) {
            throw new SecurityException("No tienes permiso para enviar mensajes en este chat");
        }

        // Crear y guardar mensaje
        Mensaje mensaje = new Mensaje();
        mensaje.setSolicitud(solicitud);
        mensaje.setRemitente(remitente);
        mensaje.setContenido(contenido);
        mensaje.setLeido(false);

        mensaje = mensajeRepository.save(mensaje);

        // Convertir a DTO
        MensajeDTO mensajeDTO = mensajeMapper.toDTO(mensaje);

        // Emitir mensaje por WebSocket
        ChatNotificacionDTO notificacion = new ChatNotificacionDTO();
        notificacion.setTipo("nuevo-mensaje");
        notificacion.setSolicitudId(solicitudId);
        notificacion.setUsuarioId(remitenteId);
        notificacion.setUsuarioNombre(remitente.getNombre());
        notificacion.setMensaje(mensajeDTO);

        messagingTemplate.convertAndSend(
                "/topic/chat/" + solicitudId,
                notificacion
        );

        return mensajeDTO;
    }

    /**
     * Obtiene el historial de mensajes de una solicitud
     */
    @Transactional(readOnly = true)
    public List<MensajeDTO> obtenerHistorial(Long solicitudId, Long usuarioId) {

        // Validar solicitud
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalStateException("Solicitud no encontrada"));

        // Validar que el usuario sea parte de la solicitud
        boolean esParticipante = solicitud.getSolicitante().getId().equals(usuarioId) ||
                (solicitud.getVoluntario() != null &&
                        solicitud.getVoluntario().getId().equals(usuarioId));

        if (!esParticipante) {
            throw new SecurityException("No tienes permiso para ver este chat");
        }

        // Obtener mensajes
        List<Mensaje> mensajes = mensajeRepository.findBySolicitudIdOrderByFechaEnvio(solicitudId);

        return mensajes.stream()
                .map(mensajeMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Marca mensajes como leídos
     */
    @Transactional
    public void marcarComoLeidos(Long solicitudId, Long usuarioId) {
        mensajeRepository.marcarMensajesComoLeidos(solicitudId, usuarioId);
    }

    /**
     * Notifica que un usuario se conectó al chat
     */
    public void notificarConexion(Long solicitudId, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        ChatNotificacionDTO notificacion = new ChatNotificacionDTO();
        notificacion.setTipo("usuario-conectado");
        notificacion.setSolicitudId(solicitudId);
        notificacion.setUsuarioId(usuarioId);
        notificacion.setUsuarioNombre(usuario.getNombre());

        messagingTemplate.convertAndSend(
                "/topic/chat/" + solicitudId,
                notificacion
        );
    }

    /**
     * Notifica al solicitante que su solicitud fue aceptada
     */
    public void notificarSolicitudAceptada(Long solicitudId, Long voluntarioId) {
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalStateException("Solicitud no encontrada"));

        Usuario voluntario = usuarioRepository.findById(voluntarioId)
                .orElseThrow(() -> new IllegalStateException("Voluntario no encontrado"));

        ChatNotificacionDTO notificacion = new ChatNotificacionDTO();
        notificacion.setTipo("solicitud-aceptada");
        notificacion.setSolicitudId(solicitudId);
        notificacion.setUsuarioId(voluntarioId);
        notificacion.setUsuarioNombre(voluntario.getNombre());

        // Enviar notificación al solicitante específico
        messagingTemplate.convertAndSend(
                "/topic/notificaciones/" + solicitud.getSolicitante().getId(),
                notificacion
        );
    }

    /**
     * Crea una sala de videollamada Jitsi
     */
    @Transactional
    public VideoCallInviteDTO crearSalaVideo(Long solicitudId, Long userId) {

        // Validar solicitud
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalStateException("Solicitud no encontrada"));

        // Validar que esté EN_PROCESO
        if (!"EN_PROCESO".equals(solicitud.getEstado())) {
            throw new IllegalStateException("Solo se puede crear videollamadas en solicitudes en proceso");
        }

        // Validar que el usuario sea participante
        boolean esParticipante = solicitud.getSolicitante().getId().equals(userId) ||
                (solicitud.getVoluntario() != null && solicitud.getVoluntario().getId().equals(userId));

        if (!esParticipante) {
            throw new SecurityException("No tienes permiso para crear videollamadas en este chat");
        }

        // Obtener usuario
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        // Generar nombre único de sala
        String roomName = "vecinotech-" + solicitudId + "-" + System.currentTimeMillis();

        // ✅ SERVIDOR ESPAÑOL SIN RESTRICCIONES
        String roomUrl = "https://meet.guifi.net/" + roomName;

        // Crear DTO
        VideoCallInviteDTO videoCall = new VideoCallInviteDTO();
        videoCall.setSolicitudId(solicitudId);
        videoCall.setRoomName(roomName);
        videoCall.setRoomUrl(roomUrl);
        videoCall.setCreadoPorId(userId);
        videoCall.setCreadoPorNombre(usuario.getNombre());
        videoCall.setFechaCreacion(LocalDateTime.now());

        // Crear notificación para WebSocket
        ChatNotificacionDTO notificacion = new ChatNotificacionDTO();
        notificacion.setTipo("video-call-invite");
        notificacion.setSolicitudId(solicitudId);
        notificacion.setUsuarioId(userId);
        notificacion.setUsuarioNombre(usuario.getNombre());
        notificacion.setVideoRoomUrl(roomUrl);
        notificacion.setVideoRoomName(roomName);

        // Emitir por WebSocket
        messagingTemplate.convertAndSend(
                "/topic/chat/" + solicitudId,
                notificacion
        );

        System.out.println("📹 Sala de videollamada creada: " + roomUrl);

        return videoCall;
    }

    /**
     * Notifica que un usuario se desconectó del chat
     */
    public void notificarDesconexion(Long solicitudId, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        ChatNotificacionDTO notificacion = new ChatNotificacionDTO();
        notificacion.setTipo("usuario-desconectado");
        notificacion.setSolicitudId(solicitudId);
        notificacion.setUsuarioId(usuarioId);
        notificacion.setUsuarioNombre(usuario.getNombre());

        messagingTemplate.convertAndSend(
                "/topic/chat/" + solicitudId,
                notificacion
        );
    }

    /**
     * Notifica al voluntario que el chat fue finalizado
     */
    public void notificarChatFinalizado(Long solicitudId, Long solicitanteId) {
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new IllegalStateException("Solicitud no encontrada"));

        // Obtener voluntario
        if (solicitud.getVoluntario() == null) {
            System.out.println("⚠️ No hay voluntario asignado para notificar");
            return;
        }

        Usuario solicitante = usuarioRepository.findById(solicitanteId)
                .orElseThrow(() -> new IllegalStateException("Solicitante no encontrado"));

        ChatNotificacionDTO notificacion = new ChatNotificacionDTO();
        notificacion.setTipo("chat-finalizado");
        notificacion.setSolicitudId(solicitudId);
        notificacion.setUsuarioId(solicitanteId);
        notificacion.setUsuarioNombre(solicitante.getNombre());

        // Notificar al voluntario
        messagingTemplate.convertAndSend(
                "/topic/chat/" + solicitudId,
                notificacion
        );

        System.out.println("✅ Notificación de chat finalizado enviada al voluntario");
    }
}