package es.daw.vecinotechbackend.repository;

import es.daw.vecinotechbackend.entity.Valoracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {

    /**
     * Busca si ya existe una valoración para una solicitud específica
     */
    Optional<Valoracion> findBySolicitudId(Long solicitudId);

    /**
     * Obtiene todas las valoraciones de un voluntario
     */
    List<Valoracion> findByVoluntarioIdOrderByFechaCreacionDesc(Long voluntarioId);

    /**
     * Verifica si el solicitante ya valoró esta solicitud
     */
    boolean existsBySolicitudIdAndSolicitanteId(Long solicitudId, Long solicitanteId);
}