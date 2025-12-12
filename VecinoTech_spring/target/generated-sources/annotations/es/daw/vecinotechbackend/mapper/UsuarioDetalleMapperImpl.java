package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.usuario.UsuarioDTO;
import es.daw.vecinotechbackend.dto.usuario.UsuarioDetalleDTO;
import es.daw.vecinotechbackend.entity.UsuarioDetalle;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-12T14:31:42+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
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
        usuarioDetalleDTO.setTelefono( entity.getTelefono() );
        usuarioDetalleDTO.setDireccion( entity.getDireccion() );
        usuarioDetalleDTO.setCiudad( entity.getCiudad() );
        usuarioDetalleDTO.setPais( entity.getPais() );
        usuarioDetalleDTO.setCodigoPostal( entity.getCodigoPostal() );
        usuarioDetalleDTO.setBio( entity.getBio() );
        usuarioDetalleDTO.setEsVoluntario( entity.isEsVoluntario() );

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

        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getTelefono() != null ) {
            entity.setTelefono( dto.getTelefono() );
        }
        if ( dto.getDireccion() != null ) {
            entity.setDireccion( dto.getDireccion() );
        }
        if ( dto.getCiudad() != null ) {
            entity.setCiudad( dto.getCiudad() );
        }
        if ( dto.getPais() != null ) {
            entity.setPais( dto.getPais() );
        }
        if ( dto.getCodigoPostal() != null ) {
            entity.setCodigoPostal( dto.getCodigoPostal() );
        }
        if ( dto.getBio() != null ) {
            entity.setBio( dto.getBio() );
        }
        entity.setEsVoluntario( dto.isEsVoluntario() );
    }
}
