package es.daw.vecinotechbackend.mapper;

import es.daw.vecinotechbackend.dto.MensajeDTO;
import es.daw.vecinotechbackend.entity.Mensaje;
import org.springframework.stereotype.Component;

@Component
public class MensajeMapper {

    public MensajeDTO toDTO(Mensaje mensaje) {
        if (mensaje == null) return null;

        MensajeDTO dto = new MensajeDTO();
        dto.setId(mensaje.getId());
        dto.setSolicitudId(mensaje.getSolicitud().getId());
        dto.setRemitenteId(mensaje.getRemitente().getId());
        dto.setRemitenteNombre(mensaje.getRemitente().getNombre());
        dto.setContenido(mensaje.getContenido());
        dto.setFechaEnvio(mensaje.getFechaEnvio());
        dto.setLeido(mensaje.isLeido());

        return dto;
    }
}