//package es.daw.vecinotechbackend.security;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
//import io.jsonwebtoken.security.Keys;
//import jakarta.annotation.PostConstruct;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import java.nio.charset.StandardCharsets;
//import java.security.Key;
//import java.time.Instant;
//import java.util.Date;
//
//@Component
//public class SessionJwtService {
//
//    @Value("${jwt.issuer:VecinoTech}") private String issuer;
//    @Value("${jwt.access.secret}")     private String accessSecret;
//    @Value("${jwt.refresh.secret}")    private String refreshSecret;
//
//    private Key accessKey;
//    private Key refreshKey;
//
//    @PostConstruct
//    void init() {
//        this.accessKey  = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
//        this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
//    }
//
//    public String createAccess(Long userId, long seconds) {
//        Instant now = Instant.now();
//        return Jwts.builder()
//                .setIssuer(issuer)
//                .setAudience("access")
//                .setSubject(String.valueOf(userId))
//                .setIssuedAt(Date.from(now))
//                .setExpiration(Date.from(now.plusSeconds(seconds)))
//                .signWith(accessKey, SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public String createRefresh(Long userId, long seconds) {
//        Instant now = Instant.now();
//        return Jwts.builder()
//                .setIssuer(issuer)
//                .setAudience("refresh")
//                .setSubject(String.valueOf(userId))
//                .setIssuedAt(Date.from(now))
//                .setExpiration(Date.from(now.plusSeconds(seconds)))
//                .signWith(refreshKey, SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public Claims parseAccess(String token) {
//        return Jwts.parserBuilder().requireAudience("access").setSigningKey(accessKey).build()
//                .parseClaimsJws(token).getBody();
//    }
//
//    public Claims parseRefresh(String token) {
//        return Jwts.parserBuilder().requireAudience("refresh").setSigningKey(refreshKey).build()
//                .parseClaimsJws(token).getBody();
//    }
//}
