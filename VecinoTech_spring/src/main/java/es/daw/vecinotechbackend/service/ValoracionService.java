//package es.daw.vecinotechbackend.service;
//
//import es.daw.vecinotechbackend.dto.valoracion.ValoracionCreateDTO;
//import es.daw.vecinotechbackend.dto.valoracion.ValoracionResponseDTO;
//import es.daw.vecinotechbackend.entity.Valoracion;
//import es.daw.vecinotechbackend.mapper.ValoracionMapper;
//import es.daw.vecinotechbackend.repository.SolicitudRepository;
//import es.daw.vecinotechbackend.repository.UsuarioRepository;
//import es.daw.vecinotechbackend.repository.ValoracionRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class ValoracionService {
//    private final ValoracionRepository repo;
//    private final UsuarioRepository usuarioRepo;
//    private final SolicitudRepository solicitudRepo;
//    private final ValoracionMapper mapper;
//
//    public ValoracionResponseDTO crear(Long autorId, ValoracionCreateDTO dto) {
//        var autor     = usuarioRepo.findById(autorId).orElseThrow();
//        var ayudado   = usuarioRepo.findById(dto.getAyudadoId()).orElseThrow();
//        var solicitud = solicitudRepo.findById(dto.getSolicitudId()).orElseThrow();
//
//        // Validaciones de negocio: solicitud cerrada, relación entre autor/ayudado/solicitud, no duplicada, etc.
//
//        var v = new Valoracion();
//        v.setAutor(autor);
//        v.setAyudado(ayudado);
//        v.setSolicitud(solicitud);
//        v.setPuntuacion(dto.getPuntuacion());
//        v.setComentario(dto.getComentario());
//
//        repo.save(v);
//        return mapper.toResponse(v);
//    }
//}
//
