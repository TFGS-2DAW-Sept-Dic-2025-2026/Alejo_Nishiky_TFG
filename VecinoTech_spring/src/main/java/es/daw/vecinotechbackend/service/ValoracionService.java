package es.daw.vecinotechbackend.service;

import es.daw.vecinotechbackend.dto.valoracion.CrearValoracionRequest;
import es.daw.vecinotechbackend.dto.valoracion.ValoracionDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.Valoracion;
import es.daw.vecinotechbackend.mapper.ValoracionMapper;
import es.daw.vecinotechbackend.repository.SolicitudRepository;
import es.daw.vecinotechbackend.repository.UsuarioRepository;
import es.daw.vecinotechbackend.repository.ValoracionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ValoracionService {

    private final ValoracionRepository valoracionRepository;
    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final ValoracionMapper valoracionMapper;

    public ValoracionService(ValoracionRepository valoracionRepository,
                             SolicitudRepository solicitudRepository,
                             UsuarioRepository usuarioRepository,
                             ValoracionMapper valoracionMapper) {
        this.valoracionRepository = valoracionRepository;
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.valoracionMapper = valoracionMapper;
    }

    /**
     * Crea una valoración para un voluntario
     */
    @Transactional
    public ValoracionDTO crearValoracion(Long solicitanteId, CrearValoracionRequest request) {

        // 1. Validar solicitud
        Solicitud solicitud = solicitudRepository.findById(request.getSolicitudId())
                .orElseThrow(() -> new IllegalStateException("Solicitud no encontrada"));

        // 2. Validar que la solicitud esté CERRADA
        if (!"CERRADA".equals(solicitud.getEstado())) {
            throw new IllegalStateException("Solo se pueden valorar solicitudes cerradas");
        }

        // 3. Validar que el usuario sea el solicitante de esta solicitud
        if (!solicitud.getSolicitante().getId().equals(solicitanteId)) {
            throw new SecurityException("Solo el solicitante puede valorar esta solicitud");
        }

        // 4. Validar que haya un voluntario asignado
        if (solicitud.getVoluntario() == null) {
            throw new IllegalStateException("Esta solicitud no tiene voluntario asignado");
        }

        // 5. Verificar que no exista ya una valoración
        if (valoracionRepository.existsBySolicitudIdAndSolicitanteId(request.getSolicitudId(), solicitanteId)) {
            throw new IllegalStateException("Ya has valorado esta solicitud");
        }

        // 6. Obtener usuarios
        Usuario solicitante = usuarioRepository.findById(solicitanteId)
                .orElseThrow(() -> new IllegalStateException("Solicitante no encontrado"));
        Usuario voluntario = solicitud.getVoluntario();

        // 7. Crear valoración
        Valoracion valoracion = new Valoracion();
        valoracion.setSolicitante(solicitante);
        valoracion.setVoluntario(voluntario);
        valoracion.setSolicitud(solicitud);
        valoracion.setPuntuacion(request.getPuntuacion());
        valoracion.setComentario(request.getComentario());

        valoracion = valoracionRepository.save(valoracion);

        System.out.println("✅ Valoración creada: " + request.getPuntuacion() + " estrellas para " + voluntario.getNombre());

        // El trigger de BD actualizará automáticamente rating_promedio y rating_total

        return valoracionMapper.toDTO(valoracion);
    }

    /**
     * Obtiene la valoración de una solicitud (si existe)
     */
    @Transactional(readOnly = true)
    public Optional<ValoracionDTO> obtenerValoracionPorSolicitud(Long solicitudId) {
        return valoracionRepository.findBySolicitudId(solicitudId)
                .map(valoracionMapper::toDTO);
    }

    /**
     * Obtiene todas las valoraciones de un voluntario
     */
    @Transactional(readOnly = true)
    public List<ValoracionDTO> obtenerValoracionesDeVoluntario(Long voluntarioId) {
        return valoracionRepository.findByVoluntarioIdOrderByFechaCreacionDesc(voluntarioId)
                .stream()
                .map(valoracionMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Verifica si una solicitud ya fue valorada
     */
    @Transactional(readOnly = true)
    public boolean yaFueValorada(Long solicitudId, Long solicitanteId) {
        return valoracionRepository.existsBySolicitudIdAndSolicitanteId(solicitudId, solicitanteId);
    }
}