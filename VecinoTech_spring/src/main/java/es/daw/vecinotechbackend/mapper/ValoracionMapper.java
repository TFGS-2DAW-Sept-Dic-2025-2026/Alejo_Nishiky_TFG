package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.ValoracionDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.Valoracion;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ValoracionMapper {

    // Entity -> DTO
    @Mappings({
            @Mapping(target = "autorId", source = "autor.id"),
            @Mapping(target = "ayudadoId", source = "ayudado.id"),
            @Mapping(target = "solicitudId", source = "solicitud.id")
    })
    ValoracionDTO toDTO(Valoracion entity);

    // DTO -> Entity
    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "autor", source = "autorId", qualifiedByName = "userRef"),
            @Mapping(target = "ayudado", source = "ayudadoId", qualifiedByName = "userRef"),
            @Mapping(target = "solicitud", source = "solicitudId", qualifiedByName = "solicitudRef"),
            @Mapping(target = "puntuacion", source = "puntuacion"),
            @Mapping(target = "comentario", source = "comentario")
    })
    Valoracion toEntity(ValoracionDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(ValoracionDTO dto, @MappingTarget Valoracion entity);

    @Named("userRef")
    default Usuario toUsuarioRef(Long id) {
        if (id == null) return null;
        Usuario u = new Usuario();
        u.setId(id);
        return u;
    }

    @Named("solicitudRef")
    default Solicitud toSolicitudRef(Long id) {
        if (id == null) return null;
        Solicitud s = new Solicitud();
        s.setId(id);
        return s;
    }
}
