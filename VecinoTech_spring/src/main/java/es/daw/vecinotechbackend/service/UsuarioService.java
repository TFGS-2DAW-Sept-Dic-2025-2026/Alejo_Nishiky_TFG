//package es.daw.vecinotechbackend.service;
//
//import es.daw.vecinotechbackend.dto.usuario.UsuarioDetalleDTO;
//import es.daw.vecinotechbackend.dto.usuario.UsuarioResponse;
//import es.daw.vecinotechbackend.dto.usuario.UsuarioUpdateDTO;
//import es.daw.vecinotechbackend.entity.UsuarioDetalle;
//import es.daw.vecinotechbackend.mapper.UsuarioDetalleMapper;
//import es.daw.vecinotechbackend.mapper.UsuarioMapper;
//import es.daw.vecinotechbackend.repository.UsuarioRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class UsuarioService {
//    private final UsuarioRepository repo;
//    private final UsuarioMapper usuarioMapper;
//    private final UsuarioDetalleMapper detalleMapper;
//
//    public UsuarioResponse actualizarPerfil(Long id, UsuarioUpdateDTO uDTO, UsuarioDetalleDTO uDetalleDto) {
//        var user = repo.findById(id).orElseThrow();
//
//        usuarioMapper.updateEntityFromDto(uDTO, user);
//
//        if (uDetalleDto != null) {
//            var detalle = user.getDetalle();
//            if (detalle == null) {
//                detalle = new UsuarioDetalle();
//                detalle.setUsuario(user);
//                user.setDetalle(detalle);
//            }
//            detalleMapper.mergeIntoEntity(uDetalleDto, detalle);
//        }
//
//        return usuarioMapper.toResponse(user);
//    }
//}
//
