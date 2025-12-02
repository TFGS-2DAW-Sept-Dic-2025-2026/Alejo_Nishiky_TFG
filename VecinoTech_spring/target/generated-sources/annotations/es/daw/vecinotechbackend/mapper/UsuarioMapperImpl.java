package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.UsuarioDTO;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.UsuarioDetalle;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-02T06:51:55+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class UsuarioMapperImpl implements UsuarioMapper {

    @Override
    public UsuarioDTO toDTO(Usuario entity) {
        if ( entity == null ) {
            return null;
        }

        UsuarioDTO usuarioDTO = new UsuarioDTO();

        usuarioDTO.setPasswordHash( entity.getPasswordHash() );
        usuarioDTO.setTelefono( entityDetalleTelefono( entity ) );
        usuarioDTO.setDireccion( entityDetalleDireccion( entity ) );
        usuarioDTO.setCiudad( entityDetalleCiudad( entity ) );
        usuarioDTO.setPais( entityDetallePais( entity ) );
        usuarioDTO.setCodigoPostal( entityDetalleCodigoPostal( entity ) );
        usuarioDTO.setBio( entityDetalleBio( entity ) );
        usuarioDTO.setActivo( entity.isActivo() );
        usuarioDTO.setAvatarUrl( entity.getAvatarUrl() );
        usuarioDTO.setEmail( entity.getEmail() );
        usuarioDTO.setId( entity.getId() );
        usuarioDTO.setNombre( entity.getNombre() );
        usuarioDTO.setRatingPromedio( entity.getRatingPromedio() );
        usuarioDTO.setRatingTotal( entity.getRatingTotal() );

        return usuarioDTO;
    }

    @Override
    public Usuario toEntity(UsuarioDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Usuario usuario = new Usuario();

        usuario.setId( dto.getId() );
        usuario.setNombre( dto.getNombre() );
        usuario.setEmail( dto.getEmail() );
        usuario.setPasswordHash( dto.getPasswordHash() );
        usuario.setAvatarUrl( dto.getAvatarUrl() );
        usuario.setRatingPromedio( dto.getRatingPromedio() );
        usuario.setRatingTotal( dto.getRatingTotal() );
        if ( dto.getActivo() != null ) {
            usuario.setActivo( dto.getActivo() );
        }

        linkDetalle( dto, usuario );

        return usuario;
    }

    @Override
    public void updateEntityFromDto(UsuarioDTO dto, Usuario entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getActivo() != null ) {
            entity.setActivo( dto.getActivo() );
        }
        if ( dto.getAvatarUrl() != null ) {
            entity.setAvatarUrl( dto.getAvatarUrl() );
        }
        if ( dto.getEmail() != null ) {
            entity.setEmail( dto.getEmail() );
        }
        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getNombre() != null ) {
            entity.setNombre( dto.getNombre() );
        }
        if ( dto.getPasswordHash() != null ) {
            entity.setPasswordHash( dto.getPasswordHash() );
        }
        if ( dto.getRatingPromedio() != null ) {
            entity.setRatingPromedio( dto.getRatingPromedio() );
        }
        if ( dto.getRatingTotal() != null ) {
            entity.setRatingTotal( dto.getRatingTotal() );
        }

        linkDetalle( dto, entity );
    }

    private String entityDetalleTelefono(Usuario usuario) {
        if ( usuario == null ) {
            return null;
        }
        UsuarioDetalle detalle = usuario.getDetalle();
        if ( detalle == null ) {
            return null;
        }
        String telefono = detalle.getTelefono();
        if ( telefono == null ) {
            return null;
        }
        return telefono;
    }

    private String entityDetalleDireccion(Usuario usuario) {
        if ( usuario == null ) {
            return null;
        }
        UsuarioDetalle detalle = usuario.getDetalle();
        if ( detalle == null ) {
            return null;
        }
        String direccion = detalle.getDireccion();
        if ( direccion == null ) {
            return null;
        }
        return direccion;
    }

    private String entityDetalleCiudad(Usuario usuario) {
        if ( usuario == null ) {
            return null;
        }
        UsuarioDetalle detalle = usuario.getDetalle();
        if ( detalle == null ) {
            return null;
        }
        String ciudad = detalle.getCiudad();
        if ( ciudad == null ) {
            return null;
        }
        return ciudad;
    }

    private String entityDetallePais(Usuario usuario) {
        if ( usuario == null ) {
            return null;
        }
        UsuarioDetalle detalle = usuario.getDetalle();
        if ( detalle == null ) {
            return null;
        }
        String pais = detalle.getPais();
        if ( pais == null ) {
            return null;
        }
        return pais;
    }

    private String entityDetalleCodigoPostal(Usuario usuario) {
        if ( usuario == null ) {
            return null;
        }
        UsuarioDetalle detalle = usuario.getDetalle();
        if ( detalle == null ) {
            return null;
        }
        String codigoPostal = detalle.getCodigoPostal();
        if ( codigoPostal == null ) {
            return null;
        }
        return codigoPostal;
    }

    private String entityDetalleBio(Usuario usuario) {
        if ( usuario == null ) {
            return null;
        }
        UsuarioDetalle detalle = usuario.getDetalle();
        if ( detalle == null ) {
            return null;
        }
        String bio = detalle.getBio();
        if ( bio == null ) {
            return null;
        }
        return bio;
    }
}
