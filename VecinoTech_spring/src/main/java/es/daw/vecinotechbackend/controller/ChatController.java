package es.daw.vecinotechbackend.controller;

import es.daw.vecinotechbackend.dto.ApiResponse;
import es.daw.vecinotechbackend.dto.chat.EnviarMensajeRequest;
import es.daw.vecinotechbackend.dto.chat.MensajeDTO;
import es.daw.vecinotechbackend.dto.VideoCallInviteDTO;
import es.daw.vecinotechbackend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


import java.util.List;

@Controller
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Obtiene el historial de mensajes de un chat
     * GET /api/portal/chat/{solicitudId}/mensajes
     */
    @GetMapping("/api/portal/chat/{solicitudId}/mensajes")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<MensajeDTO>>> obtenerHistorial(
            @PathVariable Long solicitudId) {

        try {
            Long userId = getCurrentUserId();
            List<MensajeDTO> mensajes = chatService.obtenerHistorial(solicitudId, userId);

            return ResponseEntity.ok(
                    ApiResponse.ok("Historial de mensajes obtenido", mensajes)
            );

        } catch (SecurityException e) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(403, e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Envía un mensaje (endpoint HTTP alternativo)
     * POST /api/portal/chat/{solicitudId}/enviar
     */
    @PostMapping("/api/portal/chat/{solicitudId}/enviar")
    @ResponseBody
    public ResponseEntity<ApiResponse<MensajeDTO>> enviarMensajeHTTP(
            @PathVariable Long solicitudId,
            @Valid @RequestBody EnviarMensajeRequest request) {

        try {
            Long userId = getCurrentUserId();
            MensajeDTO mensaje = chatService.enviarMensaje(solicitudId, userId, request.getContenido());

            return ResponseEntity.ok(
                    ApiResponse.ok("Mensaje enviado", mensaje)
            );

        } catch (SecurityException e) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(403, e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Marca mensajes como leídos
     * POST /api/portal/chat/{solicitudId}/leer
     */
    @PostMapping("/api/portal/chat/{solicitudId}/leer")
    @ResponseBody
    public ResponseEntity<ApiResponse<Void>> marcarComoLeidos(@PathVariable Long solicitudId) {
        try {
            Long userId = getCurrentUserId();
            chatService.marcarComoLeidos(solicitudId, userId);

            return ResponseEntity.ok(ApiResponse.ok("Mensajes marcados como leídos", null));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Notifica conexión al chat vía WebSocket
     * Cliente envía a: /app/chat/{solicitudId}/conectar
     * Se reenvía a: /topic/chat/{solicitudId}
     */
    @MessageMapping("/chat/{solicitudId}/conectar")
    public void notificarConexion(
            @DestinationVariable Long solicitudId,
            @Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor) {

        // Extraer userId del payload enviado por el frontend
        Long userId = ((Number) payload.get("userId")).longValue();
        chatService.notificarConexion(solicitudId, userId);
    }

    /**
     * Notifica desconexión del chat vía WebSocket
     * Cliente envía a: /app/chat/{solicitudId}/desconectar
     * Se reenvía a: /topic/chat/{solicitudId}
     */
    @MessageMapping("/chat/{solicitudId}/desconectar")
    public void notificarDesconexion(
            @DestinationVariable Long solicitudId,
            @Payload Map<String, Object> payload) { // ✅ CAMBIAR: recibir userId del frontend

        Long userId = ((Number) payload.get("userId")).longValue();

        chatService.notificarDesconexion(solicitudId, userId);
    }

    /**
     * Crea una sala de videollamada
     * POST /api/portal/chat/{solicitudId}/videocall/create
     */
    @PostMapping("/api/portal/chat/{solicitudId}/videocall/create")
    @ResponseBody
    public ResponseEntity<ApiResponse<VideoCallInviteDTO>> crearSalaVideo(
            @PathVariable Long solicitudId) {

        try {
            Long userId = getCurrentUserId();
            VideoCallInviteDTO videoCall = chatService.crearSalaVideo(solicitudId, userId);

            return ResponseEntity.ok(
                    ApiResponse.ok("Sala de videollamada creada", videoCall)
            );

        } catch (SecurityException e) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(403, e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    // ==================== HELPER ====================
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }
}