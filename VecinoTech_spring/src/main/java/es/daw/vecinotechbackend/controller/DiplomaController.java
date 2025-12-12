package es.daw.vecinotechbackend.controller;

import es.daw.vecinotechbackend.dto.ApiResponse;
import es.daw.vecinotechbackend.dto.diploma.DiplomaDTO;
import es.daw.vecinotechbackend.dto.diploma.DiplomaElegibilidadDTO;
import es.daw.vecinotechbackend.dto.diploma.DiplomaPublicoDTO;
import es.daw.vecinotechbackend.service.DiplomaService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static es.daw.vecinotechbackend.security.SecurityUtils.getCurrentUserId;

@Controller
@RequestMapping("/api/portal/diplomas")
public class DiplomaController {

    private final DiplomaService diplomaService;

    public DiplomaController(DiplomaService diplomaService) {
        this.diplomaService = diplomaService;
    }

    /**
     * Verifica si el usuario actual es elegible para diploma
     * GET /api/portal/diplomas/elegibilidad
     */
    @GetMapping("/elegibilidad")
    @ResponseBody
    public ResponseEntity<ApiResponse<DiplomaElegibilidadDTO>> verificarElegibilidad() {
        try {
            Long usuarioId = getCurrentUserId();
            DiplomaElegibilidadDTO elegibilidad = diplomaService.verificarElegibilidad(usuarioId);

            return ResponseEntity.ok(
                    ApiResponse.ok("Elegibilidad verificada", elegibilidad)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Genera un diploma para el usuario actual (si es elegible)
     * POST /api/portal/diplomas/generar
     */
    @PostMapping("/generar")
    @ResponseBody
    public ResponseEntity<ApiResponse<DiplomaDTO>> generarDiploma() {
        try {
            Long usuarioId = getCurrentUserId();
            DiplomaDTO diploma = diplomaService.generarDiploma(usuarioId);

            return ResponseEntity.ok(
                    ApiResponse.ok("¡Diploma generado exitosamente!", diploma)
            );

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, "Error al generar diploma: " + e.getMessage()));
        }
    }

    /**
     * Obtiene el diploma del usuario actual
     * GET /api/portal/diplomas/mi-diploma
     */
    @GetMapping("/mi-diploma")
    @ResponseBody
    public ResponseEntity<ApiResponse<DiplomaDTO>> obtenerMiDiploma() {
        try {
            Long usuarioId = getCurrentUserId();
            DiplomaDTO diploma = diplomaService.obtenerMiDiploma(usuarioId);

            return ResponseEntity.ok(
                    ApiResponse.ok("Diploma obtenido", diploma)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(
                    ApiResponse.ok("No tienes un diploma activo", null)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Obtiene diploma público por código de verificación (SIN AUTENTICACIÓN)
     * GET /api/public/diplomas/verify/{codigoVerificacion}
     *
     * Esta ruta es pública para permitir verificación externa (LinkedIn, etc.)
     */
    @GetMapping("/verify/{codigoVerificacion}")
    @ResponseBody
    public ResponseEntity<ApiResponse<DiplomaPublicoDTO>> verificarDiploma(
            @PathVariable String codigoVerificacion) {
        try {
            UUID codigo = UUID.fromString(codigoVerificacion);
            DiplomaPublicoDTO diploma = diplomaService.obtenerDiplomaPublico(codigo);

            return ResponseEntity.ok(
                    ApiResponse.ok("Diploma verificado", diploma)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(404, "Diploma no encontrado o inválido"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, "Error al verificar diploma"));
        }
    }
}