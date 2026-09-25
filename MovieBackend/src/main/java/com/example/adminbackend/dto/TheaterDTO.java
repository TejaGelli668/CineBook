package com.example.adminbackend.dto;

import com.example.adminbackend.entity.Theater;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.Map;

public class TheaterDTO {

    private Long id;

    @NotBlank(message = "Theater name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Number of screens is required")
    @Min(value = 1, message = "Theater must have at least 1 screen")
    private Integer numberOfScreens;

    @NotNull(message = "Total seats is required")
    @Min(value = 1, message = "Theater must have at least 1 seat")
    private Integer totalSeats;

    private Theater.Status status = Theater.Status.ACTIVE;

    private List<String> facilities;
    private List<String> shows;
    private Map<String, String> pricing;

    // Constructors
    public TheaterDTO() {}

    // Convert DTO to Entity
    public Theater toEntity() {
        Theater theater = new Theater();
        theater.setId(this.id);
        theater.setName(this.name);
        theater.setLocation(this.location);
        theater.setAddress(this.address);
        theater.setCity(this.city);
        theater.setState(this.state);
        theater.setPincode(this.pincode);
        theater.setPhoneNumber(this.phoneNumber);
        theater.setEmail(this.email);
        theater.setNumberOfScreens(this.numberOfScreens);
        theater.setTotalSeats(this.totalSeats);
        theater.setStatus(this.status);
        theater.setFacilities(this.facilities);
        theater.setShows(this.shows);
        theater.setPricing(this.pricing);
        return theater;
    }

    // Convert Entity to DTO
    public static TheaterDTO fromEntity(Theater theater) {
        TheaterDTO dto = new TheaterDTO();
        dto.setId(theater.getId());
        dto.setName(theater.getName());
        dto.setLocation(theater.getLocation());
        dto.setAddress(theater.getAddress());
        dto.setCity(theater.getCity());
        dto.setState(theater.getState());
        dto.setPincode(theater.getPincode());
        dto.setPhoneNumber(theater.getPhoneNumber());
        dto.setEmail(theater.getEmail());
        dto.setNumberOfScreens(theater.getNumberOfScreens());
        dto.setTotalSeats(theater.getTotalSeats());
        dto.setStatus(theater.getStatus());
        dto.setFacilities(theater.getFacilities());
        dto.setShows(theater.getShows());
        dto.setPricing(theater.getPricing());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getNumberOfScreens() { return numberOfScreens; }
    public void setNumberOfScreens(Integer numberOfScreens) { this.numberOfScreens = numberOfScreens; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Theater.Status getStatus() { return status; }
    public void setStatus(Theater.Status status) { this.status = status; }

    public List<String> getFacilities() { return facilities; }
    public void setFacilities(List<String> facilities) { this.facilities = facilities; }

    public List<String> getShows() { return shows; }
    public void setShows(List<String> shows) { this.shows = shows; }

    public Map<String, String> getPricing() { return pricing; }
    public void setPricing(Map<String, String> pricing) { this.pricing = pricing; }
}