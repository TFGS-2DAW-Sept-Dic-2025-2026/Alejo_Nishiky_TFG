package es.daw.vecinotechbackend.controller;

import es.daw.vecinotechbackend.dto.ApiResponse;
import es.daw.vecinotechbackend.dto.valoracion.CrearValoracionRequest;
import es.daw.vecinotechbackend.dto.valoracion.ValoracionDTO;
import es.daw.vecinotechbackend.service.ValoracionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static es.daw.vecinotechbackend.security.SecurityUtils.getCurrentUserId;

@Controller
@RequestMapping("/api/portal/valoraciones")
public class ValoracionController {

    private final ValoracionService valoracionService;

    public ValoracionController(ValoracionService valoracionService) {
        this.valoracionService = valoracionService;
    }

    /**
     * Crea una valoración para un voluntario
     * POST /api/portal/valoraciones
     */
    @PostMapping
    @ResponseBody
    public ResponseEntity<ApiResponse<ValoracionDTO>> crearValoracion(
            @Valid @RequestBody CrearValoracionRequest request) {

        try {
            Long solicitanteId = getCurrentUserId();
            ValoracionDTO valoracion = valoracionService.crearValoracion(solicitanteId, request);

            return ResponseEntity.ok(
                    ApiResponse.ok("Valoración creada exitosamente", valoracion)
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
     * Obtiene la valoración de una solicitud específica
     * GET /api/portal/valoraciones/solicitud/{solicitudId}
     */
    @GetMapping("/solicitud/{solicitudId}")
    @ResponseBody
    public ResponseEntity<ApiResponse<ValoracionDTO>> obtenerValoracionPorSolicitud(
            @PathVariable Long solicitudId) {

        try {
            Optional<ValoracionDTO> valoracion = valoracionService.obtenerValoracionPorSolicitud(solicitudId);

            if (valoracion.isPresent()) {
                return ResponseEntity.ok(
                        ApiResponse.ok("Valoración encontrada", valoracion.get())
                );
            } else {
                return ResponseEntity.ok(
                        ApiResponse.ok("No hay valoración para esta solicitud", null)
                );
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Obtiene todas las valoraciones de un voluntario
     * GET /api/portal/valoraciones/voluntario/{voluntarioId}
     */
    @GetMapping("/voluntario/{voluntarioId}")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<ValoracionDTO>>> obtenerValoracionesDeVoluntario(
            @PathVariable Long voluntarioId) {

        try {
            List<ValoracionDTO> valoraciones = valoracionService.obtenerValoracionesDeVoluntario(voluntarioId);

            return ResponseEntity.ok(
                    ApiResponse.ok("Valoraciones obtenidas", valoraciones)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }

    /**
     * Verifica si una solicitud ya fue valorada por el usuario actual
     * GET /api/portal/valoraciones/verificar/{solicitudId}
     */
    @GetMapping("/verificar/{solicitudId}")
    @ResponseBody
    public ResponseEntity<ApiResponse<Boolean>> verificarSiYaValorada(
            @PathVariable Long solicitudId) {

        try {
            Long solicitanteId = getCurrentUserId();
            boolean yaValorada = valoracionService.yaFueValorada(solicitudId, solicitanteId);

            return ResponseEntity.ok(
                    ApiResponse.ok("Verificación completada", yaValorada)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(1, e.getMessage()));
        }
    }
}