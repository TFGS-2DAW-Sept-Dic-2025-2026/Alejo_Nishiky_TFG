package es.daw.vecinotechbackend.repository;

import es.daw.vecinotechbackend.entity.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    /**
     * Obtiene todos los mensajes de una solicitud ordenados por fecha
     */
    @Query("""
        SELECT m FROM Mensaje m
        WHERE m.solicitud.id = :solicitudId
        ORDER BY m.fechaEnvio ASC
    """)
    List<Mensaje> findBySolicitudIdOrderByFechaEnvio(@Param("solicitudId") Long solicitudId);

    /**
     * Cuenta mensajes no leídos de una solicitud para un usuario específico
     */
    @Query("""
        SELECT COUNT(m) FROM Mensaje m
        WHERE m.solicitud.id = :solicitudId
          AND m.remitente.id != :usuarioId
          AND m.leido = false
    """)
    long countMensajesNoLeidos(
            @Param("solicitudId") Long solicitudId,
            @Param("usuarioId") Long usuarioId
    );

    /**
     * Marca todos los mensajes de una solicitud como leídos (excepto los propios)
     */
    @Modifying
    @Query("""
        UPDATE Mensaje m
        SET m.leido = true
        WHERE m.solicitud.id = :solicitudId
          AND m.remitente.id != :usuarioId
          AND m.leido = false
    """)
    int marcarMensajesComoLeidos(
            @Param("solicitudId") Long solicitudId,
            @Param("usuarioId") Long usuarioId
    );
}