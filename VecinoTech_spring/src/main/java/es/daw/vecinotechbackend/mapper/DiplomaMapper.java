package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.diploma.DiplomaDTO;
import es.daw.vecinotechbackend.dto.diploma.DiplomaPublicoDTO;
import es.daw.vecinotechbackend.entity.Diploma;
import org.springframework.stereotype.Component;

@Component
public class DiplomaMapper {

    /**
     * Convierte Diploma entity a DiplomaDTO (completo)
     */
    public DiplomaDTO toDTO(Diploma diploma) {
        if (diploma == null) {
            return null;
        }

        DiplomaDTO dto = new DiplomaDTO();
        dto.setId(diploma.getId());
        dto.setNumeroCertificado(diploma.getNumeroCertificado());
        dto.setTitulo(diploma.getTitulo());
        dto.setDescripcion(diploma.getDescripcion());

        // Info del usuario
        if (diploma.getUsuario() != null) {
            dto.setNombreCompleto(diploma.getUsuario().getNombre());
            dto.setEmailVoluntario(diploma.getUsuario().getEmail());
        }

        // Estadísticas
        dto.setTotalAyudas(diploma.getTotalAyudas());
        dto.setFechaPrimeraAyuda(diploma.getFechaPrimeraAyuda());
        dto.setFechaUltimaAyuda(diploma.getFechaUltimaAyuda());

        // Emisión
        dto.setFechaEmision(diploma.getFechaEmision());
        dto.setEmitidoPor(diploma.getEmitidoPor());

        // Verificación
        dto.setUrlPublica(diploma.getUrlPublica());
        dto.setCodigoVerificacion(diploma.getCodigoVerificacion());

        // Estado
        dto.setActivo(diploma.getActivo());

        return dto;
    }

    /**
     * Convierte Diploma entity a DiplomaPublicoDTO (solo info pública)
     */
    public DiplomaPublicoDTO toPublicoDTO(Diploma diploma) {
        if (diploma == null) {
            return null;
        }

        DiplomaPublicoDTO dto = new DiplomaPublicoDTO();
        dto.setNumeroCertificado(diploma.getNumeroCertificado());
        dto.setTitulo(diploma.getTitulo());
        dto.setDescripcion(diploma.getDescripcion());

        // Solo nombre, no email
        if (diploma.getUsuario() != null) {
            dto.setNombreCompleto(diploma.getUsuario().getNombre());
        }

        dto.setTotalAyudas(diploma.getTotalAyudas());
        dto.setFechaPrimeraAyuda(diploma.getFechaPrimeraAyuda());
        dto.setFechaUltimaAyuda(diploma.getFechaUltimaAyuda());
        dto.setFechaEmision(diploma.getFechaEmision());
        dto.setEmitidoPor(diploma.getEmitidoPor());
        dto.setEsValido(diploma.getActivo());

        return dto;
    }
}