package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.ValoracionDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.Valoracion;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-17T20:41:16+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ValoracionMapperImpl implements ValoracionMapper {

    @Override
    public ValoracionDTO toDTO(Valoracion entity) {
        if ( entity == null ) {
            return null;
        }

        ValoracionDTO valoracionDTO = new ValoracionDTO();

        valoracionDTO.setAutorId( entityAutorId( entity ) );
        valoracionDTO.setAyudadoId( entityAyudadoId( entity ) );
        valoracionDTO.setSolicitudId( entitySolicitudId( entity ) );
        valoracionDTO.setComentario( entity.getComentario() );
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
        valoracion.setAutor( toUsuarioRef( dto.getAutorId() ) );
        valoracion.setAyudado( toUsuarioRef( dto.getAyudadoId() ) );
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
        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getPuntuacion() != null ) {
            entity.setPuntuacion( dto.getPuntuacion() );
        }
    }

    private Long entityAutorId(Valoracion valoracion) {
        if ( valoracion == null ) {
            return null;
        }
        Usuario autor = valoracion.getAutor();
        if ( autor == null ) {
            return null;
        }
        Long id = autor.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long entityAyudadoId(Valoracion valoracion) {
        if ( valoracion == null ) {
            return null;
        }
        Usuario ayudado = valoracion.getAyudado();
        if ( ayudado == null ) {
            return null;
        }
        Long id = ayudado.getId();
        if ( id == null ) {
            return null;
        }
        return id;
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
