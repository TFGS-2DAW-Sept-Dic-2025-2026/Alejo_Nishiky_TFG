package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.UsuarioDTO;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.UsuarioDetalle;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {UsuarioDetalleMapper.class})
public interface UsuarioMapper {

    // ================= ENTITY -> DTO =================
    @Mapping(target = "passwordHash", source = "passwordHash")
    // Importante: incluimos también el detalle, MapStruct lo hará si el mapper existe
    @Mapping(target = "telefono", source = "detalle.telefono")
    @Mapping(target = "direccion", source = "detalle.direccion")
    @Mapping(target = "ciudad", source = "detalle.ciudad")
    @Mapping(target = "pais", source = "detalle.pais")
    @Mapping(target = "codigoPostal", source = "detalle.codigoPostal")
    @Mapping(target = "bio", source = "detalle.bio")
    UsuarioDTO toDTO(Usuario entity);

    // ================= DTO -> ENTITY =================
    @BeanMapping(ignoreByDefault = false)
    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "nombre", source = "nombre"),
            @Mapping(target = "email", source = "email"),
            @Mapping(target = "passwordHash", source = "passwordHash"),
            @Mapping(target = "avatarUrl", source = "avatarUrl"),
            @Mapping(target = "ratingPromedio", source = "ratingPromedio"),
            @Mapping(target = "ratingTotal", source = "ratingTotal"),
            @Mapping(target = "activo", source = "activo"),
            // Aquí ya no ignoramos detalle: lo resolvemos en @AfterMapping
            @Mapping(target = "detalle", ignore = true),
            @Mapping(target = "solicitudesCreadas", ignore = true),
            @Mapping(target = "solicitudesTomadas", ignore = true),
            @Mapping(target = "valoracionesRecibidas", ignore = true),
            @Mapping(target = "valoracionesEmitidas", ignore = true)
    })
    Usuario toEntity(UsuarioDTO dto);

    // ================= UPDATE (PATCH/PUT) =================
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(UsuarioDTO dto, @MappingTarget Usuario entity);

    // ================= POST-MAPPING =================
    @AfterMapping
    default void linkDetalle(UsuarioDTO dto, @MappingTarget Usuario entity) {
        if (dto == null) return;

        boolean tieneDetalle =
                notBlank(dto.getTelefono()) ||
                        notBlank(dto.getDireccion()) ||
                        notBlank(dto.getCiudad()) ||
                        notBlank(dto.getPais()) ||
                        notBlank(dto.getCodigoPostal()) ||
                        notBlank(dto.getBio());

        if (tieneDetalle) {
            UsuarioDetalle detalle = new UsuarioDetalle();
            detalle.setUsuario(entity); // clave foránea por @MapsId
            detalle.setTelefono(dto.getTelefono());
            detalle.setDireccion(dto.getDireccion());
            detalle.setCiudad(dto.getCiudad());
            detalle.setPais(dto.getPais());
            detalle.setCodigoPostal(dto.getCodigoPostal());
            detalle.setBio(dto.getBio());

            entity.setDetalle(detalle);
        }
    }

    private static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }
}
