package es.daw.vecinotechbackend.service;

import es.daw.vecinotechbackend.dto.diploma.DiplomaDTO;
import es.daw.vecinotechbackend.dto.diploma.DiplomaElegibilidadDTO;
import es.daw.vecinotechbackend.dto.diploma.DiplomaPublicoDTO;
import es.daw.vecinotechbackend.entity.Diploma;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.mapper.DiplomaMapper;
import es.daw.vecinotechbackend.repository.DiplomaRepository;
import es.daw.vecinotechbackend.repository.SolicitudRepository;
import es.daw.vecinotechbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
public class DiplomaService {

    private final DiplomaRepository diplomaRepository;
    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final DiplomaMapper diplomaMapper;

    // Configuración desde properties
    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    private static final int AYUDAS_MINIMAS = 20;

    public DiplomaService(DiplomaRepository diplomaRepository,
                          SolicitudRepository solicitudRepository,
                          UsuarioRepository usuarioRepository,
                          DiplomaMapper diplomaMapper) {
        this.diplomaRepository = diplomaRepository;
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.diplomaMapper = diplomaMapper;
    }

    /**
     * Verifica si un usuario es elegible para obtener diploma
     */
    @Transactional(readOnly = true)
    public DiplomaElegibilidadDTO verificarElegibilidad(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Contar ayudas completadas donde es voluntario
        long ayudasCompletadas = solicitudRepository.countSolicitudesAyudadas(usuarioId);

        // Verificar si es voluntario (el campo está en UsuarioDetalle)
        boolean esVoluntario = usuario.getDetalle() != null && usuario.getDetalle().isEsVoluntario();
        boolean esElegible = esVoluntario && ayudasCompletadas >= AYUDAS_MINIMAS;
        boolean tieneDiploma = diplomaRepository.existsByUsuarioIdAndActivoTrue(usuarioId);

        DiplomaDTO diplomaDTO = null;
        if (tieneDiploma) {
            Diploma diploma = diplomaRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                    .orElse(null);
            if (diploma != null) {
                diplomaDTO = diplomaMapper.toDTO(diploma);
            }
        }

        DiplomaElegibilidadDTO elegibilidad = new DiplomaElegibilidadDTO();
        elegibilidad.setEsElegible(esElegible);
        elegibilidad.setAyudasCompletadas((int) ayudasCompletadas);
        elegibilidad.setAyudasNecesarias(AYUDAS_MINIMAS);
        elegibilidad.setAyudasRestantes(Math.max(0, AYUDAS_MINIMAS - (int) ayudasCompletadas));
        elegibilidad.setTieneDiploma(tieneDiploma);
        elegibilidad.setDiploma(diplomaDTO);

        return elegibilidad;
    }

    /**
     * Genera un diploma para un usuario elegible
     */
    @Transactional
    public DiplomaDTO generarDiploma(Long usuarioId) {
        // Verificar elegibilidad
        DiplomaElegibilidadDTO elegibilidad = verificarElegibilidad(usuarioId);

        if (!elegibilidad.getEsElegible()) {
            throw new IllegalStateException("Usuario no es elegible para diploma. Necesita " +
                    elegibilidad.getAyudasRestantes() + " ayudas más.");
        }

        if (elegibilidad.getTieneDiploma()) {
            throw new IllegalStateException("Usuario ya tiene un diploma activo");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Obtener estadísticas de ayudas
        List<Solicitud> ayudasCompletadas = solicitudRepository
                .findByVoluntarioIdAndEstado(usuarioId, "CERRADA");

        LocalDate fechaPrimera = ayudasCompletadas.stream()
                .map(Solicitud::getFechaCreacion)
                .map(LocalDateTime::toLocalDate)
                .min(LocalDate::compareTo)
                .orElse(null);

        LocalDate fechaUltima = ayudasCompletadas.stream()
                .map(Solicitud::getFechaCreacion)
                .map(LocalDateTime::toLocalDate)
                .max(LocalDate::compareTo)
                .orElse(null);

        // Crear diploma
        Diploma diploma = new Diploma();
        diploma.setUsuario(usuario);
        diploma.setNumeroCertificado(generarNumeroCertificado());
        diploma.setTitulo("Diploma de Voluntariado");
        diploma.setDescripcion(generarDescripcion(usuario.getNombre(), ayudasCompletadas.size()));
        diploma.setTotalAyudas(ayudasCompletadas.size());
        diploma.setFechaPrimeraAyuda(fechaPrimera);
        diploma.setFechaUltimaAyuda(fechaUltima);
        diploma.setFechaEmision(LocalDateTime.now());
        diploma.setEmitidoPor("VecinoTech Platform");
        diploma.setCodigoVerificacion(UUID.randomUUID());
        diploma.setActivo(true);

        // Generar URL pública
        String urlPublica = frontendBaseUrl + "/diplomas/verify/" + diploma.getCodigoVerificacion();
        diploma.setUrlPublica(urlPublica);

        diploma = diplomaRepository.save(diploma);

        System.out.println("Diploma generado MAJETE!!! para usuario: " + usuarioId +
                " - Certificado: " + diploma.getNumeroCertificado());

        return diplomaMapper.toDTO(diploma);
    }

    /**
     * Obtiene diploma público por código de verificación (para URL pública)
     */
    @Transactional(readOnly = true)
    public DiplomaPublicoDTO obtenerDiplomaPublico(UUID codigoVerificacion) {
        Diploma diploma = diplomaRepository.findByCodigoVerificacionAndActivoTrue(codigoVerificacion)
                .orElseThrow(() -> new IllegalArgumentException("Diploma no encontrado o no válido"));

        return diplomaMapper.toPublicoDTO(diploma);
    }

    /**
     * Obtiene el diploma del usuario actual
     */
    @Transactional(readOnly = true)
    public DiplomaDTO obtenerMiDiploma(Long usuarioId) {
        Diploma diploma = diplomaRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("No tienes un diploma activo"));

        return diplomaMapper.toDTO(diploma);
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Genera número de certificado único
     * Formato: VTCH-YYYY-NNNNN (ej: VTCH-2025-00001)
     */
    private String generarNumeroCertificado() {
        Long count = diplomaRepository.countActiveDiplomas();
        int year = Year.now().getValue();
        String numero = String.format("%05d", count + 1);
        return String.format("VTCH-%d-%s", year, numero);
    }

    /**
     * Genera descripción personalizada del diploma
     */
    private String generarDescripcion(String nombre, int totalAyudas) {
        return String.format(
                "Por su destacada labor como voluntario en la plataforma VecinoTech, " +
                        "habiendo completado con éxito %d asistencias técnicas, " +
                        "demostrando compromiso, solidaridad y excelencia en el servicio a la comunidad.",
                totalAyudas
        );
    }
}