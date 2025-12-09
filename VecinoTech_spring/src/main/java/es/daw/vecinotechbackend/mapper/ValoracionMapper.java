package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.valoracion.ValoracionDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import es.daw.vecinotechbackend.entity.Valoracion;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ValoracionMapper {

    // ✅ Entity -> DTO (actualizado con nuevos nombres)
    @Mappings({
            @Mapping(target = "solicitanteId", source = "solicitante.id"),
            @Mapping(target = "solicitanteNombre", source = "solicitante.nombre"),
            @Mapping(target = "voluntarioId", source = "voluntario.id"),
            @Mapping(target = "voluntarioNombre", source = "voluntario.nombre"),
            @Mapping(target = "solicitudId", source = "solicitud.id")
    })
    ValoracionDTO toDTO(Valoracion entity);

    // ✅ DTO -> Entity (actualizado con nuevos nombres)
    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "solicitante", source = "solicitanteId", qualifiedByName = "userRef"),
            @Mapping(target = "voluntario", source = "voluntarioId", qualifiedByName = "userRef"),
            @Mapping(target = "solicitud", source = "solicitudId", qualifiedByName = "solicitudRef"),
            @Mapping(target = "puntuacion", source = "puntuacion"),
            @Mapping(target = "comentario", source = "comentario"),
            @Mapping(target = "fechaCreacion", ignore = true) // Se establece con @PrePersist
    })
    Valoracion toEntity(ValoracionDTO dto);

    // ✅ Update parcial
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(ValoracionDTO dto, @MappingTarget Valoracion entity);

    // ✅ Helper methods
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