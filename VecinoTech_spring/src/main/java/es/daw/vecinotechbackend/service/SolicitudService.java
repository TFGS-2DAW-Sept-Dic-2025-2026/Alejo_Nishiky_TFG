//package es.daw.vecinotechbackend.service;
//
//import es.daw.vecinotechbackend.dto.solicitud.SolicitudCreateDTO;
//import es.daw.vecinotechbackend.dto.solicitud.SolicitudResponseDTO;
//import es.daw.vecinotechbackend.entity.Solicitud;
//import es.daw.vecinotechbackend.mapper.SolicitudMapper;
//import es.daw.vecinotechbackend.repository.SolicitudRepository;
//import es.daw.vecinotechbackend.repository.UsuarioRepository;
//import lombok.RequiredArgsConstructor;
//import org.locationtech.jts.geom.Coordinate;
//import org.locationtech.jts.geom.GeometryFactory;
//import org.locationtech.jts.geom.PrecisionModel;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class SolicitudService {
//    private final SolicitudRepository repo;
//    private final UsuarioRepository usuarioRepo;
//    private final SolicitudMapper mapper;
//
//    public SolicitudResponseDTO crear(Long solicitanteId, SolicitudCreateDTO dto) {
//        var solicitante = usuarioRepo.findById(solicitanteId).orElseThrow();
//
//        var s = new Solicitud();
//        s.setSolicitante(solicitante);
//        s.setTitulo(dto.getTitulo());
//        s.setDescripcion(dto.getDescripcion());
//        s.setCategoria(dto.getCategoria());
//        s.setEstado("ABIERTA");
//
//        var gf = new GeometryFactory(new PrecisionModel(), 4326);
//        s.setUbicacion(gf.createPoint(new Coordinate(dto.getLon(), dto.getLat())));
//
//        repo.save(s);
//        return mapper.toResponse(s);
//    }
//}
//
