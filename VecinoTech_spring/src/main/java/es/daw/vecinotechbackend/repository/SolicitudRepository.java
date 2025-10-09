package es.daw.vecinotechbackend.repository;

import es.daw.vecinotechbackend.entity.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
}
