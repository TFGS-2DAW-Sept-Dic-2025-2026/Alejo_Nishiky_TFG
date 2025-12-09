package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.valoracion.ValoracionDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.Valoracion;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-09T21:47:40+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class ValoracionMapperImpl implements ValoracionMapper {

    @Override
    public ValoracionDTO toDTO(Valoracion entity) {
        if ( entity == null ) {
            return null;
        }

        ValoracionDTO valoracionDTO = new ValoracionDTO();

        valoracionDTO.setSolicitanteId( entitySolicitanteId( entity ) );
        valoracionDTO.setSolicitanteNombre( entitySolicitanteNombre( entity ) );
        valoracionDTO.setVoluntarioId( entityVoluntarioId( entity ) );
        valoracionDTO.setVoluntarioNombre( entityVoluntarioNombre( entity ) );
        valoracionDTO.setSolicitudId( entitySolicitudId( entity ) );
        valoracionDTO.setComentario( entity.getComentario() );
        valoracionDTO.setFechaCreacion( entity.getFechaCreacion() );
        valoracionDTO.setId( entity.getId() );
        valoracionDTO.setPuntuacion( entity.getPuntuacion() );

        return valoracionDTO;
    }

    @Override
    public Valoracion toEntity(ValoracionDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Valoracion valoracion = new Valoracion();

        valoracion.setId( dto.getId() );
        valoracion.setSolicitante( toUsuarioRef( dto.getSolicitanteId() ) );
        valoracion.setVoluntario( toUsuarioRef( dto.getVoluntarioId() ) );
        valoracion.setSolicitud( toSolicitudRef( dto.getSolicitudId() ) );
        valoracion.setPuntuacion( dto.getPuntuacion() );
        valoracion.setComentario( dto.getComentario() );

        return valoracion;
    }

    @Override
    public void updateEntityFromDto(ValoracionDTO dto, Valoracion entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getComentario() != null ) {
            entity.setComentario( dto.getComentario() );
        }
        if ( dto.getFechaCreacion() != null ) {
            entity.setFechaCreacion( dto.getFechaCreacion() );
        }
        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getPuntuacion() != null ) {
            entity.setPuntuacion( dto.getPuntuacion() );
        }
    }

    private Long entitySolicitanteId(Valoracion valoracion) {
        if ( valoracion == null ) {
            return null;
        }
        Usuario solicitante = valoracion.getSolicitante();
        if ( solicitante == null ) {
            return null;
        }
        Long id = solicitante.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String entitySolicitanteNombre(Valoracion valoracion) {
        if ( valoracion == null ) {
            return null;
        }
        Usuario solicitante = valoracion.getSolicitante();
        if ( solicitante == null ) {
            return null;
        }
        String nombre = solicitante.getNombre();
        if ( nombre == null ) {
            return null;
        }
        return nombre;
    }

    private Long entityVoluntarioId(Valoracion valoracion) {
        if ( valoracion == null ) {
            return null;
        }
        Usuario voluntario = valoracion.getVoluntario();
        if ( voluntario == null ) {
            return null;
        }
        Long id = voluntario.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String entityVoluntarioNombre(Valoracion valoracion) {
        if ( valoracion == null ) {
            return null;
        }
        Usuario voluntario = valoracion.getVoluntario();
        if ( voluntario == null ) {
            return null;
        }
        String nombre = voluntario.getNombre();
        if ( nombre == null ) {
            return null;
        }
        return nombre;
    }

    private Long entitySolicitudId(Valoracion valoracion) {
        if ( valoracion == null ) {
            return null;
        }
        Solicitud solicitud = valoracion.getSolicitud();
        if ( solicitud == null ) {
            return null;
        }
        Long id = solicitud.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
