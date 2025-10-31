package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.SolicitudDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
import es.daw.vecinotechbackend.entity.Usuario;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SolicitudMapper {

    @Mapping(source = "solicitante.id", target = "solicitanteId")
    @Mapping(source = "solicitante.nombre", target = "solicitanteNombre")
    @Mapping(source = "voluntario.id", target = "voluntarioId")
    @Mapping(source = "voluntario.nombre", target = "voluntarioNombre")
    @Mapping(source = "ubicacion", target = "ubicacion", qualifiedByName = "pointToUbicacionDTO")
    SolicitudDTO toDTO(Solicitud entity);

    @Mapping(target = "solicitante", ignore = true)
    @Mapping(target = "voluntario", ignore = true)
    @Mapping(source = "ubicacion", target = "ubicacion", qualifiedByName = "ubicacionDTOToPoint")
    Solicitud toEntity(SolicitudDTO dto);

    /**
     * Convierte Point de JTS a DTO simple
     */
    @Named("pointToUbicacionDTO")
    default SolicitudDTO.UbicacionDTO pointToUbicacionDTO(Point point) {
        if (point == null) {
            return null;
        }
        return new SolicitudDTO.UbicacionDTO(
                point.getY(), // latitud
                point.getX()  // longitud
        );
    }

    /**
     * Convierte DTO a Point de JTS
     */
    @Named("ubicacionDTOToPoint")
    default Point ubicacionDTOToPoint(SolicitudDTO.UbicacionDTO dto) {
        if (dto == null || dto.getLatitud() == null || dto.getLongitud() == null) {
            return null;
        }

        var factory = new org.locationtech.jts.geom.GeometryFactory(
                new org.locationtech.jts.geom.PrecisionModel(),
                4326
        );

        return factory.createPoint(
                new org.locationtech.jts.geom.Coordinate(
                        dto.getLongitud(), // X = longitud
                        dto.getLatitud()   // Y = latitud
                )
        );
    }
}
