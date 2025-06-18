package com.example.adminbackend.dto;

public class LoginResponse {

    private String token;
    private String type;
    private AdminResponse admin;
    private String message;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(String token, String type, AdminResponse admin, String message) {
        this.token = token;
        this.type = type;
        this.admin = admin;
        this.message = message;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public AdminResponse getAdmin() { return admin; }
    public void setAdmin(AdminResponse admin) { this.admin = admin; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}