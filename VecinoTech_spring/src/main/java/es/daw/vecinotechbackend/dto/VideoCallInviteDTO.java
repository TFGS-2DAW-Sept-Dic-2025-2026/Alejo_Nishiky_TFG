package es.daw.vecinotechbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoCallInviteDTO {
    private Long solicitudId;
    private String roomName;
    private String roomUrl;
    private Long creadoPorId;
    private String creadoPorNombre;
    private LocalDateTime fechaCreacion;
}
