package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.solicitud.ISolicitudMapaDTO;
import es.daw.vecinotechbackend.dto.solicitud.SolicitudDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-12T14:31:42+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class SolicitudMapperImpl implements SolicitudMapper {

    @Override
    public SolicitudDTO toDTO(Solicitud entity) {
        if ( entity == null ) {
            return null;
        }

        SolicitudDTO solicitudDTO = new SolicitudDTO();

        solicitudDTO.setSolicitanteId( entitySolicitanteId( entity ) );
        solicitudDTO.setSolicitanteNombre( entitySolicitanteNombre( entity ) );
        solicitudDTO.setVoluntarioId( entityVoluntarioId( entity ) );
        solicitudDTO.setVoluntarioNombre( entityVoluntarioNombre( entity ) );
        solicitudDTO.setUbicacion( pointToUbicacionDTO( entity.getUbicacion() ) );
        solicitudDTO.setId( entity.getId() );
        solicitudDTO.setTitulo( entity.getTitulo() );
        solicitudDTO.setDescripcion( entity.getDescripcion() );
        solicitudDTO.setCategoria( entity.getCategoria() );
        solicitudDTO.setEstado( entity.getEstado() );
        solicitudDTO.setFechaCreacion( entity.getFechaCreacion() );

        return solicitudDTO;
    }

    @Override
    public Solicitud toEntity(SolicitudDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Solicitud solicitud = new Solicitud();

        solicitud.setUbicacion( ubicacionDTOToPoint( dto.getUbicacion() ) );
        solicitud.setId( dto.getId() );
        solicitud.setTitulo( dto.getTitulo() );
        solicitud.setDescripcion( dto.getDescripcion() );
        solicitud.setCategoria( dto.getCategoria() );
        solicitud.setEstado( dto.getEstado() );
        solicitud.setFechaCreacion( dto.getFechaCreacion() );

        return solicitud;
    }

    @Override
    public ISolicitudMapaDTO toMapaDTO(Solicitud entity) {
        if ( entity == null ) {
            return null;
        }

        ISolicitudMapaDTO iSolicitudMapaDTO = new ISolicitudMapaDTO();

        iSolicitudMapaDTO.setUbicacion( pointToMapaUbicacionDTO( entity.getUbicacion() ) );
        iSolicitudMapaDTO.setSolicitante( toSolicitanteDTO( entity.getSolicitante() ) );
        iSolicitudMapaDTO.setFechaCreacion( localDateTimeToString( entity.getFechaCreacion() ) );
        iSolicitudMapaDTO.setId( entity.getId() );
        iSolicitudMapaDTO.setTitulo( entity.getTitulo() );
        iSolicitudMapaDTO.setDescripcion( entity.getDescripcion() );
        iSolicitudMapaDTO.setCategoria( entity.getCategoria() );
        iSolicitudMapaDTO.setEstado( entity.getEstado() );
        iSolicitudMapaDTO.setVoluntario( usuarioToVoluntarioDTO( entity.getVoluntario() ) );

        return iSolicitudMapaDTO;
    }

    private Long entitySolicitanteId(Solicitud solicitud) {
        if ( solicitud == null ) {
            return null;
        }
        Usuario solicitante = solicitud.getSolicitante();
        if ( solicitante == null ) {
            return null;
        }
        Long id = solicitante.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String entitySolicitanteNombre(Solicitud solicitud) {
        if ( solicitud == null ) {
            return null;
        }
        Usuario solicitante = solicitud.getSolicitante();
        if ( solicitante == null ) {
            return null;
        }
        String nombre = solicitante.getNombre();
        if ( nombre == null ) {
            return null;
        }
        return nombre;
    }

    private Long entityVoluntarioId(Solicitud solicitud) {
        if ( solicitud == null ) {
            return null;
        }
        Usuario voluntario = solicitud.getVoluntario();
        if ( voluntario == null ) {
            return null;
        }
        Long id = voluntario.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String entityVoluntarioNombre(Solicitud solicitud) {
        if ( solicitud == null ) {
            return null;
        }
        Usuario voluntario = solicitud.getVoluntario();
        if ( voluntario == null ) {
            return null;
        }
        String nombre = voluntario.getNombre();
        if ( nombre == null ) {
            return null;
        }
        return nombre;
    }

    protected ISolicitudMapaDTO.VoluntarioDTO usuarioToVoluntarioDTO(Usuario usuario) {
        if ( usuario == null ) {
            return null;
        }

        ISolicitudMapaDTO.VoluntarioDTO voluntarioDTO = new ISolicitudMapaDTO.VoluntarioDTO();

        voluntarioDTO.setId( usuario.getId() );
        voluntarioDTO.setNombre( usuario.getNombre() );

        return voluntarioDTO;
    }
}
