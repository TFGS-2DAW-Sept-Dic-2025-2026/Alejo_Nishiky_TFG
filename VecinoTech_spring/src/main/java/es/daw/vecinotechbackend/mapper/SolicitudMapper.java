package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.SolicitudDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = GeoMapper.class)
public interface SolicitudMapper {

    // Entity -> DTO (Point -> lat/lon)
    @Mappings({
            @Mapping(target = "solicitanteId", source = "solicitante.id"),
            @Mapping(target = "voluntarioId", source = "voluntario.id"),
            @Mapping(target = "lat", source = "ubicacion", qualifiedByName = "toLat"),
            @Mapping(target = "lon", source = "ubicacion", qualifiedByName = "toLon")
    })
    SolicitudDTO toDTO(Solicitud entity);

    // DTO -> Entity (ids -> refs, lat/lon -> Point)
    @Mappings({
            @Mapping(target = "id", source = "id"),
            @Mapping(target = "solicitante", source = "solicitanteId", qualifiedByName = "userRef"),
            @Mapping(target = "voluntario", source = "voluntarioId", qualifiedByName = "userRef"),
            @Mapping(target = "titulo", source = "titulo"),
            @Mapping(target = "descripcion", source = "descripcion"),
            @Mapping(target = "categoria", source = "categoria"),
            @Mapping(target = "estado", source = "estado"),
            @Mapping(target = "ubicacion", expression = "java(toPoint(dto.getLat(), dto.getLon(), geometryFactory))")
    })
    Solicitud toEntity(SolicitudDTO dto, @Context GeometryFactory geometryFactory);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(SolicitudDTO dto, @MappingTarget Solicitud entity, @Context GeometryFactory geometryFactory);

    // Helpers
    @Named("userRef")
    default Usuario toUsuarioRef(Long id) {
        if (id == null) return null;
        Usuario u = new Usuario();
        u.setId(id);
        return u;
    }

    default Point toPoint(Double lat, Double lon, GeometryFactory geometryFactory) {
        return new GeoMapper().toPoint(lat, lon, geometryFactory);
    }
}
