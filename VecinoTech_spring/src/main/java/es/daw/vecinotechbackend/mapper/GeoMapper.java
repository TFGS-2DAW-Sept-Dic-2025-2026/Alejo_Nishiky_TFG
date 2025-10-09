package es.daw.vecinotechbackend.mapper;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.mapstruct.Context;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

@Component
public class GeoMapper {

    @Named("toPoint")
    public Point toPoint(Double lat, Double lon, @Context GeometryFactory geometryFactory) {
        if (lat == null || lon == null) return null;
        // ¡OJO!: x=lon, y=lat
        Point p = geometryFactory.createPoint(new Coordinate(lon, lat));
        p.setSRID(4326);
        return p;
    }

    @Named("toLat")
    public Double toLat(Point point) {
        return (point == null) ? null : point.getY();
    }

    @Named("toLon")
    public Double toLon(Point point) {
        return (point == null) ? null : point.getX();
    }
}

