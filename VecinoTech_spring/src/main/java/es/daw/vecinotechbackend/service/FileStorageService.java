package es.daw.vecinotechbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:src/main/resources/static/avatars}")
    private String uploadDir;

    /**
     * Guarda un archivo de avatar y retorna la URL pública
     */
    public String guardarAvatar(MultipartFile file, Long userId) throws IOException {

        // Validar que sea una imagen
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            throw new IllegalArgumentException("El archivo debe ser una imagen (JPG, PNG, etc.)");
        }

        // Validar tamaño (máx 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("La imagen no puede superar 5MB");
        }

        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único: userId_timestamp.extension
        String extension = getExtension(file.getOriginalFilename());
        String fileName = "user_" + userId + "_" + System.currentTimeMillis() + extension;

        // Guardar archivo
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar URL pública
        return "/avatars/" + fileName;
    }

    /**
     * Elimina un avatar anterior
     */
    public void eliminarAvatar(String avatarUrl) {
        try {
            if (avatarUrl != null && avatarUrl.startsWith("/avatars/")) {
                String fileName = avatarUrl.replace("/avatars/", "");
                Path filePath = Paths.get(uploadDir).resolve(fileName);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            System.err.println("Error al eliminar avatar: " + e.getMessage());
        }
    }

    /**
     * Obtiene la extensión del archivo
     */
    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int lastDot = filename.lastIndexOf('.');
        return (lastDot == -1) ? ".jpg" : filename.substring(lastDot);
    }
}