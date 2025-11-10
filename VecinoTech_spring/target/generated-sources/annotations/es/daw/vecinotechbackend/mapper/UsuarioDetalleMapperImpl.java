package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.UsuarioDTO;
import es.daw.vecinotechbackend.dto.UsuarioDetalleDTO;
import es.daw.vecinotechbackend.entity.UsuarioDetalle;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T08:17:51+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class UsuarioDetalleMapperImpl implements UsuarioDetalleMapper {

    @Override
    public UsuarioDetalleDTO toDTO(UsuarioDetalle entity) {
        if ( entity == null ) {
            return null;
        }

        UsuarioDetalleDTO usuarioDetalleDTO = new UsuarioDetalleDTO();

        usuarioDetalleDTO.setId( entity.getId() );
        usuarioDetalleDTO.setBio( entity.getBio() );
        usuarioDetalleDTO.setCiudad( entity.getCiudad() );
        usuarioDetalleDTO.setCodigoPostal( entity.getCodigoPostal() );
        usuarioDetalleDTO.setDireccion( entity.getDireccion() );
        usuarioDetalleDTO.setEsVoluntario( entity.isEsVoluntario() );
        usuarioDetalleDTO.setPais( entity.getPais() );
        usuarioDetalleDTO.setTelefono( entity.getTelefono() );

        return usuarioDetalleDTO;
    }

    @Override
    public UsuarioDetalle toEntity(UsuarioDetalleDTO dto) {
        if ( dto == null ) {
            return null;
        }

        UsuarioDetalle usuarioDetalle = new UsuarioDetalle();

        usuarioDetalle.setId( dto.getId() );
        usuarioDetalle.setUsuario( toUsuarioRef( dto.getId() ) );
        usuarioDetalle.setTelefono( dto.getTelefono() );
        usuarioDetalle.setDireccion( dto.getDireccion() );
        usuarioDetalle.setCiudad( dto.getCiudad() );
        usuarioDetalle.setPais( dto.getPais() );
        usuarioDetalle.setCodigoPostal( dto.getCodigoPostal() );
        usuarioDetalle.setBio( dto.getBio() );
        usuarioDetalle.setEsVoluntario( dto.isEsVoluntario() );

        return usuarioDetalle;
    }

    @Override
    public UsuarioDetalle fromUsuarioDTO(UsuarioDTO dto) {
        if ( dto == null ) {
            return null;
        }

        UsuarioDetalle usuarioDetalle = new UsuarioDetalle();

        usuarioDetalle.setTelefono( dto.getTelefono() );
        usuarioDetalle.setDireccion( dto.getDireccion() );
        usuarioDetalle.setCiudad( dto.getCiudad() );
        usuarioDetalle.setPais( dto.getPais() );
        usuarioDetalle.setCodigoPostal( dto.getCodigoPostal() );
        usuarioDetalle.setBio( dto.getBio() );

        usuarioDetalle.setEsVoluntario( false );

        return usuarioDetalle;
    }

    @Override
    public void updateEntityFromDto(UsuarioDetalleDTO dto, UsuarioDetalle entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getBio() != null ) {
            entity.setBio( dto.getBio() );
        }
        if ( dto.getCiudad() != null ) {
            entity.setCiudad( dto.getCiudad() );
        }
        if ( dto.getCodigoPostal() != null ) {
            entity.setCodigoPostal( dto.getCodigoPostal() );
        }
        if ( dto.getDireccion() != null ) {
            entity.setDireccion( dto.getDireccion() );
        }
        entity.setEsVoluntario( dto.isEsVoluntario() );
        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getPais() != null ) {
            entity.setPais( dto.getPais() );
        }
        if ( dto.getTelefono() != null ) {
            entity.setTelefono( dto.getTelefono() );
        }
    }
}
