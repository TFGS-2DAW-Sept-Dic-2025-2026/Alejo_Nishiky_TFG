package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.SolicitudDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import javax.annotation.processing.Generated;
import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-17T19:47:53+0200",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251001-1143, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class SolicitudMapperImpl implements SolicitudMapper {

    @Autowired
    private GeoMapper geoMapper;

    @Override
    public SolicitudDTO toDTO(Solicitud entity) {
        if ( entity == null ) {
            return null;
        }

        SolicitudDTO solicitudDTO = new SolicitudDTO();

        solicitudDTO.setSolicitanteId( entitySolicitanteId( entity ) );
        solicitudDTO.setVoluntarioId( entityVoluntarioId( entity ) );
        solicitudDTO.setLat( geoMapper.toLat( entity.getUbicacion() ) );
        solicitudDTO.setLon( geoMapper.toLon( entity.getUbicacion() ) );
        solicitudDTO.setCategoria( entity.getCategoria() );
        solicitudDTO.setDescripcion( entity.getDescripcion() );
        solicitudDTO.setEstado( entity.getEstado() );
        solicitudDTO.setId( entity.getId() );
        solicitudDTO.setTitulo( entity.getTitulo() );

        return solicitudDTO;
    }

    @Override
    public Solicitud toEntity(SolicitudDTO dto, GeometryFactory geometryFactory) {
        if ( dto == null ) {
            return null;
        }

        Solicitud solicitud = new Solicitud();

        solicitud.setId( dto.getId() );
        solicitud.setSolicitante( toUsuarioRef( dto.getSolicitanteId() ) );
        solicitud.setVoluntario( toUsuarioRef( dto.getVoluntarioId() ) );
        solicitud.setTitulo( dto.getTitulo() );
        solicitud.setDescripcion( dto.getDescripcion() );
        solicitud.setCategoria( dto.getCategoria() );
        solicitud.setEstado( dto.getEstado() );

        solicitud.setUbicacion( toPoint(dto.getLat(), dto.getLon(), geometryFactory) );

        return solicitud;
    }

    @Override
    public void updateEntityFromDto(SolicitudDTO dto, Solicitud entity, GeometryFactory geometryFactory) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getCategoria() != null ) {
            entity.setCategoria( dto.getCategoria() );
        }
        if ( dto.getDescripcion() != null ) {
            entity.setDescripcion( dto.getDescripcion() );
        }
        if ( dto.getEstado() != null ) {
            entity.setEstado( dto.getEstado() );
        }
        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getTitulo() != null ) {
            entity.setTitulo( dto.getTitulo() );
        }
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
}
