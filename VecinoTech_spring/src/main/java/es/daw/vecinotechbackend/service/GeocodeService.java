package es.daw.vecinotechbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Servicio de geocodificación usando HttpURLConnection
 * SOLUCIÓN al problema de User-Agent con RestTemplate
 */
@Service
public class GeocodeService {

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String USER_AGENT = "VecinoTech/1.0 (+https://github.com/tu-usuario/vecinotech; contacto@vecinotech.com)";

    /**
     * Geocodifica con Nominatim usando HttpURLConnection
     */
    public Point geocodificar(String direccion, String ciudad, String codigoPostal, String pais) {
        Point resultado;

        // Intento 1: Dirección completa
        System.out.println("🔍 Intento 1: Dirección completa");
        resultado = intentarGeocodificar(limpiarDireccion(direccion), ciudad, codigoPostal, pais);
        if (resultado != null) return resultado;

        // Intento 2: Dirección sin número
        if (direccion != null && !direccion.isBlank()) {
            System.out.println("⚠️ Intento 2: Sin número de portal");
            resultado = intentarGeocodificar(eliminarNumero(direccion), ciudad, codigoPostal, pais);
            if (resultado != null) return resultado;
        }

        // Intento 3: Solo calle + ciudad (sin CP)
        if (direccion != null && !direccion.isBlank() && ciudad != null && !ciudad.isBlank()) {
            System.out.println("⚠️ Intento 3: Solo calle + ciudad (sin CP)");
            resultado = intentarGeocodificar(eliminarNumero(direccion), ciudad, null, pais);
            if (resultado != null) return resultado;
        }

        // Intento 4: Solo CP + país
        if (codigoPostal != null && !codigoPostal.isBlank()) {
            System.out.println("⚠️ Intento 4: Solo código postal");
            resultado = intentarGeocodificar(null, null, codigoPostal, pais);
            if (resultado != null) return resultado;
        }

        // Intento 5: Solo ciudad + país
        if (ciudad != null && !ciudad.isBlank()) {
            System.out.println("⚠️ Intento 5: Solo ciudad");
            resultado = intentarGeocodificar(null, ciudad, null, pais);
            if (resultado != null) return resultado;
        }

        System.out.println("❌ Geocodificación fallida después de 5 intentos");
        return null;
    }

    /**
     * Realiza petición usando HttpURLConnection (solución del foro)
     */
    private Point intentarGeocodificar(String direccion, String ciudad, String codigoPostal, String pais) {
        HttpURLConnection connection = null;
        BufferedReader reader = null;

        try {
            // Construir query
            StringBuilder query = new StringBuilder();

            if (direccion != null && !direccion.isBlank()) {
                query.append(direccion);
            }
            if (ciudad != null && !ciudad.isBlank()) {
                if (query.length() > 0) query.append(", ");
                query.append(ciudad);
            }
            if (codigoPostal != null && !codigoPostal.isBlank()) {
                if (query.length() > 0) query.append(", ");
                query.append(codigoPostal);
            }
            if (pais != null && !pais.isBlank()) {
                if (query.length() > 0) query.append(", ");
                query.append(pais);
            } else {
                if (query.length() > 0) query.append(", ");
                query.append("Spain");
            }

            String queryStr = query.toString().trim();
            String encoded = URLEncoder.encode(queryStr, StandardCharsets.UTF_8);

            // URL minimalista
            String urlString = String.format(
                    "https://nominatim.openstreetmap.org/search?q=%s&format=json&limit=1",
                    encoded
            );

            System.out.println("   📍 Query: " + queryStr);

            // ✅ CLAVE: Usar HttpURLConnection con User-Agent personalizado
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();

            // Configurar petición HTTP completa
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", USER_AGENT);
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("Accept-Language", "en");
            connection.setConnectTimeout(10000); // 10 segundos timeout
            connection.setReadTimeout(10000);

            // Rate limiting
            Thread.sleep(1500);

            // Verificar código de respuesta
            int responseCode = connection.getResponseCode();
            System.out.println("   📊 Response Code: " + responseCode);

            if (responseCode != 200) {
                System.out.println("   ❌ Error HTTP: " + responseCode);
                return null;
            }

            // Leer respuesta
            reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8)
            );

            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }

            String jsonResponse = response.toString();

            if (jsonResponse.isEmpty() || jsonResponse.equals("[]")) {
                System.out.println("   ❌ Sin resultados");
                return null;
            }

            // Parsear JSON
            JsonNode root = objectMapper.readTree(jsonResponse);

            if (!root.isArray() || root.size() == 0) {
                System.out.println("   ❌ Array vacío");
                return null;
            }

            JsonNode first = root.get(0);

            if (first.has("lat") && first.has("lon")) {
                double lat = first.get("lat").asDouble();
                double lon = first.get("lon").asDouble();

                System.out.println("   ✅ Éxito: [lat=" + lat + ", lon=" + lon + "]");

                return geometryFactory.createPoint(new Coordinate(lon, lat));
            }

            return null;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("   ⚠️ Interrupción");
            return null;
        } catch (Exception e) {
            System.err.println("   ❌ Error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            return null;
        } finally {
            // Cerrar recursos
            try {
                if (reader != null) reader.close();
                if (connection != null) connection.disconnect();
            } catch (Exception e) {
                // Ignorar errores al cerrar
            }
        }
    }

    /**
     * Limpia abreviaturas
     */
    private String limpiarDireccion(String dir) {
        if (dir == null || dir.isBlank()) return null;

        return dir
                .replaceAll("(?i)^Ca\\.", "Calle")
                .replaceAll("(?i)^C\\.", "Calle")
                .replaceAll("(?i)^Av\\.", "Avenida")
                .replaceAll("(?i)^Avda\\.", "Avenida")
                .replaceAll(",?\\s*\\d+º.*$", "")
                .replaceAll(",?\\s*piso.*$", "")
                .trim();
    }

    /**
     * Elimina número de portal
     */
    private String eliminarNumero(String dir) {
        if (dir == null || dir.isBlank()) return null;

        String limpia = limpiarDireccion(dir);
        return limpia
                .replaceAll("\\s+\\d+\\s*$", "")
                .replaceAll(",\\s*\\d+\\s*$", "")
                .trim();
    }

    /**
     * Geocodifica solo por código postal
     */
    public Point geocodificarPorCP(String codigoPostal, String pais) {
        if (codigoPostal == null || codigoPostal.isBlank()) return null;
        return intentarGeocodificar(null, null, codigoPostal, pais);
    }

    /**
     * Calcula distancia entre dos puntos (Haversine)
     */
    public double calcularDistancia(Point p1, Point p2) {
        if (p1 == null || p2 == null) return -1;

        double lat1 = Math.toRadians(p1.getY());
        double lon1 = Math.toRadians(p1.getX());
        double lat2 = Math.toRadians(p2.getY());
        double lon2 = Math.toRadians(p2.getX());

        double dLat = lat2 - lat1;
        double dLon = lon2 - lon1;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return 6371000 * c;
    }
}