package es.daw.vecinotechbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefijo para mensajes que van al cliente (suscripciones)
        config.enableSimpleBroker("/topic", "/queue");

        // Prefijo para mensajes que vienen del cliente
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket con SockJS como fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:4200", "http://127.0.0.1:4200")
                .withSockJS();
    }
}