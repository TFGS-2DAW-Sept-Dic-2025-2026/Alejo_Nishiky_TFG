package es.daw.vecinotechbackend.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtils {

    private final String issuer;
    private final byte[] key; // HMAC secret (>=32 chars para HS256)

    public JwtUtils(@Value("${jwt.issuer}") String issuer,
                    @Value("${jwt.link.secret}") String secret) {
        this.issuer = issuer;
        this.key = secret.getBytes(StandardCharsets.UTF_8);
    }

    // ===================== EMISIÓN =====================

    /** Token de sesión (ejemplo futuro; roles opcionales). */
    public String createSessionToken(Authentication auth, long ttlSeconds) {
        String subject = auth.getName(); // username o email
        List<String> authorities = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(subject)
                .claim("authorities", authorities)
                .claim("purpose", "session")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(Keys.hmacShaKeyFor(key), Jwts.SIG.HS256)
                .compact();
    }

    /** Token de activación de cuenta (24h por defecto). */
    public String createActivationToken(Long userId, String email, long ttlSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(email)
                .claim("uid", userId)
                .claim("purpose", "account_activation")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(Keys.hmacShaKeyFor(key), Jwts.SIG.HS256)
                .compact();
    }

    /** Token de reset de contraseña (por ejemplo 24h). */
    public String createPasswordResetToken(String email, long ttlSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(email)
                .claim("purpose", "password_reset")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(Keys.hmacShaKeyFor(key), Jwts.SIG.HS256)
                .compact();
    }

    // ===================== VALIDACIÓN =====================

    /** Valida firma, issuer y caducidad. Devuelve Jws<Claims> si es válido. */
    public Jws<Claims> validate(String token) {
        return Jwts.parser()
                .requireIssuer(issuer)
                .verifyWith(Keys.hmacShaKeyFor(key))
                .build()
                .parseSignedClaims(token);
    }

    /** Valida y además exige un 'purpose' concreto. */
    public Claims validateAndRequirePurpose(String token, String requiredPurpose) {
        Claims c = validate(token).getPayload();
        String p = c.get("purpose", String.class);
        if (p == null || !p.equals(requiredPurpose)) {
            throw new IllegalArgumentException("Token con propósito inválido: " + p);
        }
        return c;
    }

    // ===================== EMISIÓN (access / refresh) =====================
    public String createAccessToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim("purpose", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(15, ChronoUnit.MINUTES)))
                .signWith(Keys.hmacShaKeyFor(key), Jwts.SIG.HS256)
                .compact();
    }

    public String createRefreshToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim("purpose", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(7, ChronoUnit.DAYS)))
                .signWith(Keys.hmacShaKeyFor(key), Jwts.SIG.HS256)
                .compact();
    }

    // ===================== VALIDACIÓN (refresh) =====================
    public Long validateRefreshAndGetUserId(String token) {
        Claims c = validateAndRequirePurpose(token, "refresh"); // valida firma/issuer/exp y purpose
        return Long.valueOf(c.getSubject());
    }


    // ===================== EXTRAS =====================
    public String extractSubject(Claims claims) {
        return claims.getSubject();
    }

    public Long extractUserId(Claims claims) { return claims.get("uid", Long.class); }
    @SuppressWarnings("unchecked")
    public List<String> extractAuthorities(Claims claims) {
        Object list = claims.get("authorities");
        return (list instanceof Collection<?> col)
                ? col.stream().map(Object::toString).toList()
                : List.of();
    }
    // ===================== VALIDACIÓN (access) =====================
    public Long validateAccessAndGetUserId(String token) {
        Claims c = validateAndRequirePurpose(token, "access");
        return Long.valueOf(c.getSubject());
    }

}