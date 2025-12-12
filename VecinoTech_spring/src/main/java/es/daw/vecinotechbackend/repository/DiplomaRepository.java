package es.daw.vecinotechbackend.repository;

import es.daw.vecinotechbackend.entity.Diploma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface DiplomaRepository extends JpaRepository<Diploma, Long> {

    /**
     * Busca el diploma activo de un usuario
     */
    Optional<Diploma> findByUsuarioIdAndActivoTrue(Long usuarioId);

    /**
     * Busca diploma por código de verificación (para URL pública)
     */
    Optional<Diploma> findByCodigoVerificacionAndActivoTrue(UUID codigoVerificacion);

    /**
     * Busca diploma por número de certificado
     */
    Optional<Diploma> findByNumeroCertificadoAndActivoTrue(String numeroCertificado);

    /**
     * Verifica si un usuario ya tiene diploma
     */
    boolean existsByUsuarioIdAndActivoTrue(Long usuarioId);

    /**
     * Cuenta cuántos diplomas activos hay (para generar número de certificado)
     */
    @Query("SELECT COUNT(d) FROM Diploma d WHERE d.activo = true")
    Long countActiveDiplomas();
}