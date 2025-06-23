//// src/main/java/com/example/adminbackend/entity/Theater.java
//package com.example.adminbackend.entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import com.fasterxml.jackson.annotation.JsonManagedReference;
//import jakarta.persistence.*;
//import java.util.List;
//
//@Entity
//@Table(name = "theaters")
//public class Theater {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    // Basic info
//    private String name;
//    private String location;
//    private String city;
//    private String address;
//    private String state;
//    private String pincode;
//    private String phoneNumber;
//    private String email;
//
//    // Specs
//    private Integer numberOfScreens;
//    private Integer totalSeats;
//
//    // Active/Inactive/etc.
//    private String status;
//
//    // e.g. M-Ticket, IMAX, etc.
//    @ElementCollection
//    @CollectionTable(
//            name = "theater_facilities",
//            joinColumns = @JoinColumn(name = "theater_id")
//    )
//    @Column(name = "facility")
//    private List<String> facilities;
//
//    // ← parent side of Theater ↔ Seat
//    @OneToMany(mappedBy = "theater", cascade = CascadeType.ALL)
//    @JsonIgnore
//    private List<Seat> seats;
//
//    public Theater() {}
//
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public String getName() { return name; }
//    public void setName(String name) { this.name = name; }
//
//    public String getLocation() { return location; }
//    public void setLocation(String location) { this.location = location; }
//
//    public String getCity() { return city; }
//    public void setCity(String city) { this.city = city; }
//
//    public String getAddress() { return address; }
//    public void setAddress(String address) { this.address = address; }
//
//    public String getState() { return state; }
//    public void setState(String state) { this.state = state; }
//
//    public String getPincode() { return pincode; }
//    public void setPincode(String pincode) { this.pincode = pincode; }
//
//    public String getPhoneNumber() { return phoneNumber; }
//    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
//
//    public String getEmail() { return email; }
//    public void setEmail(String email) { this.email = email; }
//
//    public Integer getNumberOfScreens() { return numberOfScreens; }
//    public void setNumberOfScreens(Integer numberOfScreens) { this.numberOfScreens = numberOfScreens; }
//
//    public Integer getTotalSeats() { return totalSeats; }
//    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
//
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
//
//    public List<String> getFacilities() { return facilities; }
//    public void setFacilities(List<String> facilities) { this.facilities = facilities; }
//
//    public List<Seat> getSeats() { return seats; }
//    public void setSeats(List<Seat> seats) { this.seats = seats; }
//}
// Theater.java
// Theater.java
package com.example.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "theaters")
public class Theater {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Theater name is required")
    private String name;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Location is required")
    private String location;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Address is required")
    private String address;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "City is required")
    private String city;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "State is required")
    private String state;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Pincode is required")
    private String pincode;

    // Map to the correct database column 'phone_number'
    @Column(name = "phone_number", nullable = true, length = 255)
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @Column(nullable = true, length = 255)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // Map to the correct database column 'number_of_screens'
    @Column(name = "number_of_screens", nullable = true)
    @NotNull(message = "Number of screens is required")
    @Min(value = 1, message = "Theater must have at least 1 screen")
    private Integer numberOfScreens;

    @Column(name = "total_seats", nullable = true)
    @NotNull(message = "Total seats is required")
    @Min(value = 1, message = "Theater must have at least 1 seat")
    private Integer totalSeats;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    // Add the timestamp fields that exist in your database
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Store facilities as JSON string
    @ElementCollection
    @CollectionTable(name = "theater_facilities", joinColumns = @JoinColumn(name = "theater_id"))
    @Column(name = "facility")
    private List<String> facilities = new ArrayList<>();

    // Store show times as JSON string
    @ElementCollection
    @CollectionTable(name = "theater_shows", joinColumns = @JoinColumn(name = "theater_id"))
    @Column(name = "show_time")
    @JsonIgnore
    private List<String> shows = new ArrayList<>();

    // Store pricing as JSON
    @ElementCollection
    @CollectionTable(name = "theater_pricing", joinColumns = @JoinColumn(name = "theater_id"))
    @MapKeyColumn(name = "time_slot")
    @Column(name = "price")
    private Map<String, String> pricing = new HashMap<>();

    public enum Status {
        ACTIVE, INACTIVE, UNDER_MAINTENANCE
    }

    // Constructors
    public Theater() {}

    // Add PrePersist and PreUpdate for timestamps
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<String> getFacilities() { return facilities; }
    public void setFacilities(List<String> facilities) { this.facilities = facilities; }

    public List<String> getShows() { return shows; }
    public void setShows(List<String> shows) { this.shows = shows; }

    public Map<String, String> getPricing() { return pricing; }
    public void setPricing(Map<String, String> pricing) { this.pricing = pricing; }
}