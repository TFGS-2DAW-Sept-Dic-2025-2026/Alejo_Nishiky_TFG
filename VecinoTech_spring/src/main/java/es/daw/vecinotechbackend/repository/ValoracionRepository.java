package es.daw.vecinotechbackend.repository;

import es.daw.vecinotechbackend.entity.Valoracion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {
}
