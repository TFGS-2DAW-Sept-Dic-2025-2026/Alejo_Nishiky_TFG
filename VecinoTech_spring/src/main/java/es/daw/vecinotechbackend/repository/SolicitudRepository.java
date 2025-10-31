package es.daw.vecinotechbackend.repository;

import es.daw.vecinotechbackend.entity.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    interface LeaderProjection {
        String getNombre();
        Long getPoints();
    }

    @Query("""
       SELECT s.voluntario.nombre AS nombre, COUNT(s.id) AS points
       FROM Solicitud s
       WHERE s.estado = 'CERRADA' AND s.voluntario IS NOT NULL
       GROUP BY s.voluntario.nombre
       ORDER BY COUNT(s.id) DESC
    """)
    List<LeaderProjection> topVolunteersByClosedRequests();

    // ============= MIS QUERIES DE GEOLOCALIZACIÓN ===================

    /*
     * Projection para incluir distancia en los resultados
     */
    interface SolicitudConDistancia {
        Long getId();
        String getTitulo();
        String getDescripcion();
        String getCategoria();
        String getEstado();
        Double getDistancia(); // en metros
    }

    /**
     * Busca solicitudes abiertas cerca de una ubicación
     * @param lon Longitud del punto de referencia
     * @param lat Latitud del punto de referencia
     * @param radiusMeters Radio de búsqueda en metros (ej: 5000 = 5km)
     * @param limit Máximo de resultados
     * @return Lista de solicitudes ordenadas por distancia (más cercana primero)
     */
    @Query(value = """
        SELECT s.id, s.titulo,
            s.descripcion,
            s.categoria,
            s.estado,
            s.fecha_creacion,
            s.solicitante_id,
            s.voluntario_id,
            s.ubicacion,
            ST_Distance(
                s.ubicacion,
                ST_SetSRID(ST_Point(:lon, :lat), 4326)::geography
            ) as distancia
        FROM solicitud s
        WHERE s.estado = 'ABIERTA'
          AND s.ubicacion IS NOT NULL
          AND ST_DWithin(
              s.ubicacion,
              ST_SetSRID(ST_Point(:lon, :lat), 4326)::geography,
              :radiusMeters
          )
        ORDER BY distancia ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<Solicitud> findSolicitudesNearby(
            @Param("lon") double lon,
            @Param("lat") double lat,
            @Param("radiusMeters") int radiusMeters,
            @Param("limit") int limit
    );

    /**
     * Cuenta solicitudes abiertas en un radio
     */
    @Query(value = """
        SELECT COUNT(*)
        FROM solicitud s
        WHERE s.estado = 'ABIERTA'
          AND s.ubicacion IS NOT NULL
          AND ST_DWithin(
              s.ubicacion,
              ST_SetSRID(ST_Point(:lon, :lat), 4326)::geography,
              :radiusMeters
          )
        """, nativeQuery = true)
    long countSolicitudesNearby(
            @Param("lon") double lon,
            @Param("lat") double lat,
            @Param("radiusMeters") int radiusMeters
    );

    /**
     * Busca todas las solicitudes abiertas con ubicación (para mapa)
     */
    @Query("""
        SELECT s FROM Solicitud s
        WHERE s.estado = 'ABIERTA'
          AND s.ubicacion IS NOT NULL
        ORDER BY s.fechaCreacion DESC
    """)
    List<Solicitud> findAllAbiertasConUbicacion();

    /**
     * Busca solicitudes de un usuario específico
     */
    @Query("""
        SELECT s FROM Solicitud s
        WHERE s.solicitante.id = :usuarioId
        ORDER BY s.fechaCreacion DESC
    """)
    List<Solicitud> findBySolicitanteId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca solicitudes donde el usuario es voluntario
     */
    @Query("""
        SELECT s FROM Solicitud s
        WHERE s.voluntario.id = :usuarioId
        ORDER BY s.fechaCreacion DESC
    """)
    List<Solicitud> findByVoluntarioId(@Param("usuarioId") Long usuarioId);

}
