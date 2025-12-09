package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.usuario.UsuarioDTO;
import es.daw.vecinotechbackend.dto.usuario.UsuarioDetalleDTO;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.UsuarioDetalle;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UsuarioDetalleMapper {

    // Entity -> DTO
    @Mapping(target = "id", source = "id")
    UsuarioDetalleDTO toDTO(UsuarioDetalle entity);

    // DTO -> Entity
    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "usuario", source = "id", qualifiedByName = "userRef"),
            @Mapping(target = "telefono", source = "telefono"),
            @Mapping(target = "direccion", source = "direccion"),
            @Mapping(target = "ciudad", source = "ciudad"),
            @Mapping(target = "pais", source = "pais"),
            @Mapping(target = "codigoPostal", source = "codigoPostal"),
            @Mapping(target = "bio", source = "bio"),
            @Mapping(target = "esVoluntario", source = "esVoluntario")
    })
    UsuarioDetalle toEntity(UsuarioDetalleDTO dto);

    // NUEVO: crear detalle desde UsuarioDTO (campos planos)
    @Mappings({
            @Mapping(target = "id", ignore = true),       // @MapsId lo pondrá al persistir
            @Mapping(target = "usuario", ignore = true),  // lo linkeamos en @AfterMapping del UsuarioMapper
            @Mapping(target = "telefono", source = "telefono"),
            @Mapping(target = "direccion", source = "direccion"),
            @Mapping(target = "ciudad", source = "ciudad"),
            @Mapping(target = "pais", source = "pais"),
            @Mapping(target = "codigoPostal", source = "codigoPostal"),
            @Mapping(target = "bio", source = "bio"),
            @Mapping(target = "esVoluntario", constant = "false")
    })
    UsuarioDetalle fromUsuarioDTO(UsuarioDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(UsuarioDetalleDTO dto, @MappingTarget UsuarioDetalle entity);

    @Named("userRef")
    default Usuario toUsuarioRef(Long id) {
        if (id == null) return null;
        Usuario u = new Usuario();
        u.setId(id);
        return u;
    }
}
