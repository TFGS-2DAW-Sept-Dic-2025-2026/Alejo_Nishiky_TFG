package es.daw.vecinotechbackend.controller;

import es.daw.vecinotechbackend.api.ApiResponse;
import es.daw.vecinotechbackend.dto.EnviarMensajeRequest;
import es.daw.vecinotechbackend.dto.MensajeDTO;
import es.daw.vecinotechbackend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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
    @SendTo("/topic/chat/{solicitudId}")
    public void notificarConexion(@DestinationVariable Long solicitudId) {
        Long userId = getCurrentUserId();
        chatService.notificarConexion(solicitudId, userId);
    }

    // ==================== HELPER ====================

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }
}