//package es.daw.vecinotechbackend.security;
//
//import io.jsonwebtoken.*;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import java.nio.charset.StandardCharsets;
//import java.security.Key;
//import java.time.Instant;
//import java.util.Date;
//import java.util.Map;
//
//@Component
//public class JwtService {
//
//    private final Key linkSecretKey;
//    private final String issuer;
//
//    public JwtService(
//            @Value("${jwt.link.secret}") String linkSecret,
//            @Value("${jwt.issuer:VecinoTech}") String issuer) {
//        this.linkSecretKey = Keys.hmacShaKeyFor(linkSecret.getBytes(StandardCharsets.UTF_8));
//        this.issuer = issuer;
//    }
//
//    public String createLinkToken(Long userId, String purpose, long expiresInSeconds) {
//        Instant now = Instant.now();
//        return Jwts.builder()
//                .setIssuer(issuer)
//                .setAudience("email-link")
//                .setSubject(String.valueOf(userId))
//                .addClaims(Map.of("purpose", purpose))
//                .setIssuedAt(Date.from(now))
//                .setExpiration(Date.from(now.plusSeconds(expiresInSeconds)))
//                .signWith(linkSecretKey, SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public Jws<Claims> parseAndValidateLinkToken(String token) {
//        return Jwts.parserBuilder()
//                .requireAudience("email-link")
//                .setSigningKey(linkSecretKey)
//                .build()
//                .parseClaimsJws(token);
//    }
//
//    public Long getUserId(Jws<Claims> jws) {
//        return Long.valueOf(jws.getBody().getSubject());
//    }
//
//    public String getPurpose(Jws<Claims> jws) {
//        return String.valueOf(jws.getBody().get("purpose"));
//    }
//}
//
