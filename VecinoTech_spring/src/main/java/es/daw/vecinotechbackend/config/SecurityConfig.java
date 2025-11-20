package es.daw.vecinotechbackend.config;

import es.daw.vecinotechbackend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /*Configuración de mi CORS */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Orígenes del front
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:4200",
                "http://127.0.0.1:4200"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE", "OPTIONS")); // "OPTIONS PARA QUE?" Los navegadores hacen preflight CORS con OPTIONS antes de un POST/PUT/PATCH con headers no simples (ej. Authorization). Si no permites OPTIONS, verás errores CORS aunque tu endpoint GET/POST funcione.
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);       // si usas cookies/autorización
        config.setMaxAge(Duration.ofHours(1));  // cache del preflight

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/zonaUsuario/**",
                                "/avatars/**",
                                "/api/auth/**",
                                "/api/health",
                                "/v3/api-docs/**",
                                "/swagger-ui/**")
                        .permitAll() //De momento permitimos todos, ya después lo cerramos a roles y JWT
                        .requestMatchers("/api/portal/**").authenticated()
                        .anyRequest().permitAll() //<--- Después tengo que cambiar a requerir auth
                )
                //IMPORTANTE: Sesiones STATELESS para JWToken
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                //Añade filtro JWT
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
