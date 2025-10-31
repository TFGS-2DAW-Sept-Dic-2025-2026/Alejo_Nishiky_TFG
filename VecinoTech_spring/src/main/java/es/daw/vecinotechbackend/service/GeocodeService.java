package es.daw.vecinotechbackend.service;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 Servicio de geocodificación usando Nominatim (OpenStreetMap)

 IMPORTANTE: Nominatim tiene rate limit de 1 req/segundo
 === Para producción considera: ===
 - Usar tu propia instancia de Nominatim
 - Implementar caché de resultados
 - Añadir User-Agent personalizado
 */

@Service
public class GeocodeService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    // User-Agent recomendado por Nominatim
    private static final String USER_AGENT = "VecinoTech/1.0 (contact@vecinotech.com)";

    /*
     * Geocodifica una dirección completa
     * @return Point con coordenadas o null si no se encuentra
     */
    public Point geocodificar(String direccion, String ciudad, String codigoPostal, String pais){
        try {
            // Construir query
            StringBuilder queryBuilder = new StringBuilder();

            if (direccion != null && !direccion.isBlank()) {
                queryBuilder.append(direccion).append(", ");
            }
            if (ciudad != null && !ciudad.isBlank()) {
                queryBuilder.append(ciudad).append(", ");
            }
            if (codigoPostal != null && !codigoPostal.isBlank()) {
                queryBuilder.append(codigoPostal).append(", ");
            }
            if (pais != null && !pais.isBlank()) {
                queryBuilder.append(pais);
            } else {
                queryBuilder.append("España"); // Por defecto
            }

            String query = queryBuilder.toString();
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);

            String url = String.format(
                    "https://nominatim.openstreetmap.org/search?q=%s&format=json&limit=1",
                    encodedQuery
            );

            System.out.println("🌍 Geocodificando: " + query);

            // Llamada a Nominatim
            Object[] response = restTemplate.getForObject(url, Object[].class);

            if (response != null && response.length > 0) {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = (Map<String, Object>) response[0];

                double lat = Double.parseDouble(result.get("lat").toString());
                double lon = Double.parseDouble(result.get("lon").toString());

                System.out.println("Coordenadas encontradas: [" + lat + ", " + lon + "]");

                // Crear Point con JTS (lon, lat) - IMPORTANTE: el orden es lon, lat
                return geometryFactory.createPoint(new Coordinate(lon, lat));
            }

            System.out.println("!!!! No se encontraron coordenadas para: " + query);
            return null;

        } catch (Exception e) {
            System.err.println(" !!!  Error geocodificando: " + e.getMessage());
            return null;
        }

    }

    /*
     * ==== Geocodifica solo por código postal (más rápido y confiable) =====
     */
    public Point geocodificarPorCP(String codigoPostal, String pais) {
        if (codigoPostal == null || codigoPostal.isBlank()) {
            return null;
        }
        return geocodificar(null, null, codigoPostal, pais);
    }

    /*
     * ===== Obtiene la distancia en metros entre dos puntos ======
     */
    public double calcularDistancia(Point punto1, Point punto2) {
        if (punto1 == null || punto2 == null) {
            return -1;
        }

        // Fórmula de Haversine para calcular distancia en esfera
        double lat1 = Math.toRadians(punto1.getY());
        double lon1 = Math.toRadians(punto1.getX());
        double lat2 = Math.toRadians(punto2.getY());
        double lon2 = Math.toRadians(punto2.getX());

        double dLat = lat2 - lat1;
        double dLon = lon2 - lon1;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Radio de la Tierra en metros
        double radioTierra = 6371000;

        return radioTierra * c;
    }
}
