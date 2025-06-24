package com.example.adminbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    // NEW: Additional response metadata
    private LocalDateTime timestamp;
    private String status; // HTTP status description
    private Integer statusCode; // HTTP status code
    private String path; // Request path
    private Long count; // For paginated/list responses
    private Map<String, Object> metadata; // Additional metadata

    // Constructors
    public ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(boolean success, String message, T data, Integer statusCode) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
        this.timestamp = LocalDateTime.now();
    }

    // Static factory methods for error responses (used by GlobalExceptionHandler)
    public static ApiResponse<Object> error(String message) {
        return new ApiResponse<>(false, message, null, 500);
    }

    public static ApiResponse<Map<String, String>> error(String message, Map<String, String> errors) {
        return new ApiResponse<>(false, message, errors, 400);
    }

    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(false, message, data, 500);
    }

    public static <T> ApiResponse<T> error(String message, T data, Integer statusCode) {
        return new ApiResponse<>(false, message, data, statusCode);
    }

    // Static factory methods for success responses
    public static ApiResponse<Object> success(String message) {
        return new ApiResponse<>(true, message, null, 200);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, 200);
    }

    public static <T> ApiResponse<T> success(String message, T data, Integer statusCode) {
        return new ApiResponse<>(true, message, data, statusCode);
    }

    // NEW: Enhanced factory methods for specific use cases
    public static <T> ApiResponse<T> created(String message, T data) {
        return new ApiResponse<>(true, message, data, 201);
    }

    public static ApiResponse<Object> accepted(String message) {
        return new ApiResponse<>(true, message, null, 202);
    }

    public static ApiResponse<Object> noContent(String message) {
        return new ApiResponse<>(true, message, null, 204);
    }

    public static ApiResponse<Object> badRequest(String message) {
        return new ApiResponse<>(false, message, null, 400);
    }

    public static ApiResponse<Object> unauthorized(String message) {
        return new ApiResponse<>(false, message, null, 401);
    }

    public static ApiResponse<Object> forbidden(String message) {
        return new ApiResponse<>(false, message, null, 403);
    }

    public static ApiResponse<Object> notFound(String message) {
        return new ApiResponse<>(false, message, null, 404);
    }

    public static ApiResponse<Object> conflict(String message) {
        return new ApiResponse<>(false, message, null, 409);
    }

    public static ApiResponse<Object> internalServerError(String message) {
        return new ApiResponse<>(false, message, null, 500);
    }

    // NEW: Builder pattern for complex responses
    public static <T> ApiResponseBuilder<T> builder() {
        return new ApiResponseBuilder<>();
    }

    public static class ApiResponseBuilder<T> {
        private boolean success;
        private String message;
        private T data;
        private Integer statusCode;
        private String path;
        private Long count;
        private Map<String, Object> metadata;

        public ApiResponseBuilder<T> success(boolean success) {
            this.success = success;
            return this;
        }

        public ApiResponseBuilder<T> message(String message) {
            this.message = message;
            return this;
        }

        public ApiResponseBuilder<T> data(T data) {
            this.data = data;
            return this;
        }

        public ApiResponseBuilder<T> statusCode(Integer statusCode) {
            this.statusCode = statusCode;
            return this;
        }

        public ApiResponseBuilder<T> path(String path) {
            this.path = path;
            return this;
        }

        public ApiResponseBuilder<T> count(Long count) {
            this.count = count;
            return this;
        }

        public ApiResponseBuilder<T> metadata(Map<String, Object> metadata) {
            this.metadata = metadata;
            return this;
        }

        public ApiResponse<T> build() {
            ApiResponse<T> response = new ApiResponse<>(success, message, data, statusCode);
            response.setPath(path);
            response.setCount(count);
            response.setMetadata(metadata);
            return response;
        }
    }

    // NEW: Utility methods for setting additional info
    public ApiResponse<T> withPath(String path) {
        this.path = path;
        return this;
    }

    public ApiResponse<T> withCount(Long count) {
        this.count = count;
        return this;
    }

    public ApiResponse<T> withMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
        return this;
    }

    public ApiResponse<T> withMetadata(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new java.util.HashMap<>();
        }
        this.metadata.put(key, value);
        return this;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    @Override
    public String toString() {
        return "ApiResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", data=" + data +
                ", timestamp=" + timestamp +
                ", statusCode=" + statusCode +
                ", path='" + path + '\'' +
                ", count=" + count +
                '}';
    }
}