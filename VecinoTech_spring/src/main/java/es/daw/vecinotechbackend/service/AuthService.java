//package es.daw.vecinotechbackend.service;
//
//
//import es.daw.vecinotechbackend.entity.Usuario;
//import es.daw.vecinotechbackend.entity.UsuarioDetalle;
//import es.daw.vecinotechbackend.repository.UsuarioRepository;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//@Service
//public class AuthService {
//
//    private final UsuarioRepository usuarios;
//    private final PasswordEncoder passwordEncoder;
//
//    public AuthService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder) {
//        this.usuarios = usuarios;
//        this.passwordEncoder = passwordEncoder;
//    }
//}

//    @Transactional
//    public UsuarioResponse registrar(RegistroRequest req) {
//        // 1) Validaciones básicas
//        if (!req.getPassword().equals(req.getConfirmarPassword())) {
//            throw new IllegalArgumentException("Las contraseñas no coinciden");
//        }
//        if (usuarios.existsByEmail(req.getEmail())) {
//            throw new IllegalArgumentException("El email ya está registrado");
//        }
//
//        // 2) Crear Usuario (activo=false hasta confirmar 2FA)
//        Usuario u = new Usuario();
//        u.setNombre(req.getNombre());
//        u.setEmail(req.getEmail());
//        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
//        u.setAvatarUrl(req.getAvatarUrl()); // opcional
//        u.setRatingPromedio(0.0);
//        u.setRatingTotal(0);
//        u.setActivo(false);
//
//        // 3) Crear detalle SOLO si hay algún dato de perfil
//        boolean hayDetalle =
//                notEmpty(req.getTelefono()) ||
//                        notEmpty(req.getDireccion()) ||
//                        notEmpty(req.getCiudad())    ||
//                        notEmpty(req.getPais())      ||
//                        notEmpty(req.getCodigoPostal()) ||
//                        notEmpty(req.getBio());
//
//        if (hayDetalle) {
//            UsuarioDetalle det = new UsuarioDetalle();
//            det.setUsuario(u);       // @MapsId vincula PK=usuario_id
//            det.setTelefono(req.getTelefono());
//            det.setDireccion(req.getDireccion());
//            det.setCiudad(req.getCiudad());
//            det.setPais(req.getPais());
//            det.setCodigoPostal(req.getCodigoPostal());
//            det.setBio(req.getBio());
//            u.setDetalle(det);
//        }
//
//        // 4) Persistir
//        Usuario saved = usuarios.save(u);
//
//        // 5) Devolver UsuarioResponse aplanado
//        UsuarioResponse resp = new UsuarioResponse();
//        resp.setId(saved.getId());
//        resp.setNombre(saved.getNombre());
//        resp.setEmail(saved.getEmail());
//        resp.setAvatarUrl(saved.getAvatarUrl());
//        resp.setFechaCreacion(saved.getFechaCreacion());
//        resp.setRatingPromedio(saved.getRatingPromedio());
//        resp.setRatingTotal(saved.getRatingTotal());
//        resp.setActivo(saved.isActivo());
//
//        if (saved.getDetalle() != null) {
//            resp.setTelefono(saved.getDetalle().getTelefono());
//            resp.setDireccion(saved.getDetalle().getDireccion());
//            resp.setCiudad(saved.getDetalle().getCiudad());
//            resp.setPais(saved.getDetalle().getPais());
//            resp.setCodigoPostal(saved.getDetalle().getCodigoPostal());
//            resp.setBio(saved.getDetalle().getBio());
//        }
//
//        // (Opcional) aquí disparas el envío de código 2FA / email verificación
//        return resp;
//    }
//
//    private boolean notEmpty(String s) {
//        return s != null && !s.isBlank();
//    }
//}
