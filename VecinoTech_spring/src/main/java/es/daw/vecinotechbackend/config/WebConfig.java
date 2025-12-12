package es.daw.vecinotechbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración para servir archivos estáticos (avatares)
 * y configuración adicional de CORS si es necesario
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:src/main/resources/static/avatars}")
    private String uploadDir;

    /**
     * Configura Spring para servir archivos desde /avatars
     * mapeando al directorio físico configurado
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        
        // Servir avatares desde el sistema de archivos
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600); // Cache 1 hora

    }

    /**
     * OPCIONAL: Configuración CORS adicional para recursos estáticos
     * (solo si tienes problemas de CORS con las imágenes)
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/avatars/**")
                .allowedOrigins("http://localhost:4200", "http://127.0.0.1:4200")
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowCredentials(false)
                .maxAge(3600);
    }
}