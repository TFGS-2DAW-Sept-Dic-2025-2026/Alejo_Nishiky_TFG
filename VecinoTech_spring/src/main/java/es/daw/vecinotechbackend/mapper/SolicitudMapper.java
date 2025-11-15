package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.ISolicitudMapaDTO;
import es.daw.vecinotechbackend.dto.SolicitudDTO;
import es.daw.vecinotechbackend.entity.Solicitud;
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

    // ==================== NUEVO MÉTODO PARA EL MAPA ====================

    /**
     * Convierte Solicitud a formato específico para el mapa del frontend
     */
    @Mapping(source = "ubicacion", target = "ubicacion", qualifiedByName = "pointToMapaUbicacionDTO")
    @Mapping(source = "solicitante", target = "solicitante", qualifiedByName = "toSolicitanteDTO")
    @Mapping(source = "fechaCreacion", target = "fechaCreacion", qualifiedByName = "localDateTimeToString")
    ISolicitudMapaDTO toMapaDTO(Solicitud entity);

    // ==================== MÉTODOS DE CONVERSIÓN ORIGINALES ====================

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

    // ==================== CONVERSIONES PARA MAPA ====================

    /**
     * Convierte Point a UbicacionDTO del mapa
     */
    @Named("pointToMapaUbicacionDTO")
    default ISolicitudMapaDTO.UbicacionDTO pointToMapaUbicacionDTO(Point point) {
        if (point == null) {
            return null;
        }
        return new ISolicitudMapaDTO.UbicacionDTO(
                point.getY(), // latitud
                point.getX()  // longitud
        );
    }

    /**
     * Convierte Usuario a SolicitanteDTO del mapa
     */
    @Named("toSolicitanteDTO")
    default ISolicitudMapaDTO.SolicitanteDTO toSolicitanteDTO(
            es.daw.vecinotechbackend.entity.Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        return new ISolicitudMapaDTO.SolicitanteDTO(
                usuario.getId(),
                usuario.getNombre()
        );
    }

    /**
     * Convierte LocalDateTime a String ISO 8601
     */
    @Named("localDateTimeToString")
    default String localDateTimeToString(java.time.LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.toString(); // Formato ISO: 2025-01-11T10:30:00
    }
}