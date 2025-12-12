package es.daw.vecinotechbackend.dto.diploma;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para verificar si un usuario es elegible para diploma
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiplomaElegibilidadDTO {
    private Boolean esElegible;
    private Integer ayudasCompletadas;
    private Integer ayudasNecesarias;
    private Integer ayudasRestantes;
    private Boolean tieneDiploma;
    private DiplomaDTO diploma;
}