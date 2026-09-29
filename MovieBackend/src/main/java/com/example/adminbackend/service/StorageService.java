package com.example.adminbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Stores uploaded images (film posters, snack photos, profile pictures).
 *
 * With SUPABASE_URL and SUPABASE_SERVICE_KEY set, files go to a public Supabase
 * Storage bucket and the full public URL is returned, so they survive redeploys
 * (hosts like Render wipe the server's disk). Otherwise they're saved under
 * uploads/ on this server and a "/uploads/..." path is returned, as before.
 */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);
    private static final long MAX_BYTES = 5 * 1024 * 1024;
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg", "image/jpg", ".jpg", "image/png", ".png",
            "image/gif", ".gif", "image/webp", ".webp");
    public static final Set<String> FOLDERS = Set.of(
            "movie-posters", "food-images", "profile-pictures", "theater-images", "promotional-images");

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private volatile boolean bucketReady = false;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String serviceKey;

    @Value("${supabase.storage-bucket:cinebook-media}")
    private String bucket;

    /** A problem with the upload the person can fix (shown to them as-is). */
    public static class UploadException extends RuntimeException {
        public UploadException(String message) {
            super(message);
        }
    }

    public boolean usesSupabase() {
        return supabaseUrl != null && !supabaseUrl.isBlank() && serviceKey != null && !serviceKey.isBlank();
    }

    /** Saves an image into a folder and returns its URL (Supabase) or path (local). */
    public String store(String folder, MultipartFile file) {
        if (!FOLDERS.contains(folder)) throw new UploadException("Unknown upload folder");
        if (file == null || file.isEmpty()) throw new UploadException("Choose an image to upload");
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String ext = EXTENSIONS.get(type);
        if (ext == null) throw new UploadException("Use a JPEG, PNG, GIF or WebP image");
        if (file.getSize() > MAX_BYTES) throw new UploadException("The image must be under 5 MB");

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new UploadException("The image couldn't be read. Try again.");
        }
        // Don't trust the type the browser claims: the file must really start like that image type
        if (!looksLike(type, bytes)) throw new UploadException("That file isn't a valid image");

        String name = UUID.randomUUID() + ext;
        try {
            return usesSupabase() ? storeInSupabase(folder, name, type, bytes) : storeLocally(folder, name, bytes);
        } catch (IOException e) {
            log.error("Couldn't store {}/{}: {}", folder, name, e.getMessage());
            throw new UploadException("The image couldn't be saved. Try again.");
        }
    }

    private String storeLocally(String folder, String name, byte[] bytes) throws IOException {
        Path dir = Paths.get("uploads", folder);
        Files.createDirectories(dir);
        Files.write(dir.resolve(name), bytes);
        return "/uploads/" + folder + "/" + name;
    }

    private String storeInSupabase(String folder, String name, String type, byte[] bytes) throws IOException {
        ensureBucket();
        String base = supabaseUrl.replaceAll("/+$", "");
        String objectPath = folder + "/" + name;
        HttpResponse<String> res = send(HttpRequest.newBuilder(URI.create(base + "/storage/v1/object/" + bucket + "/" + objectPath))
                .header("Content-Type", type)
                .header("Cache-Control", "max-age=31536000")
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes)));
        if (res.statusCode() / 100 != 2) {
            log.error("Supabase Storage upload failed ({}): {}", res.statusCode(), res.body());
            throw new IOException("Supabase Storage returned " + res.statusCode());
        }
        return base + "/storage/v1/object/public/" + bucket + "/" + objectPath;
    }

    /** Creates the public bucket the first time it's needed (does nothing if it exists). */
    private void ensureBucket() throws IOException {
        if (bucketReady) return;
        String base = supabaseUrl.replaceAll("/+$", "");
        String body = "{\"id\":\"" + bucket + "\",\"name\":\"" + bucket + "\",\"public\":true,"
                + "\"file_size_limit\":" + MAX_BYTES + ",\"allowed_mime_types\":[\"image/jpeg\",\"image/png\",\"image/gif\",\"image/webp\"]}";
        HttpResponse<String> res = send(HttpRequest.newBuilder(URI.create(base + "/storage/v1/bucket"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)));
        boolean exists = res.statusCode() == 409 || res.body().contains("already exists") || res.body().contains("Duplicate");
        if (res.statusCode() / 100 != 2 && !exists) {
            log.error("Couldn't create Supabase Storage bucket {} ({}): {}", bucket, res.statusCode(), res.body());
            throw new IOException("Supabase Storage bucket unavailable");
        }
        bucketReady = true;
    }

    private HttpResponse<String> send(HttpRequest.Builder request) throws IOException {
        request.header("apikey", serviceKey).timeout(Duration.ofSeconds(30));
        // Legacy service-role keys are JWTs and also go in Authorization; new sb_secret_ keys only need apikey
        if (serviceKey.startsWith("eyJ")) request.header("Authorization", "Bearer " + serviceKey);
        try {
            return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Interrupted");
        }
    }

    /** Checks the file's first bytes ("magic number") match the claimed image type. */
    private static boolean looksLike(String type, byte[] b) {
        if (b.length < 12) return false;
        return switch (type) {
            case "image/jpeg", "image/jpg" -> (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
            case "image/png" -> (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
            case "image/gif" -> b[0] == 'G' && b[1] == 'I' && b[2] == 'F' && b[3] == '8';
            case "image/webp" -> b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                    && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
            default -> false;
        };
    }
}
