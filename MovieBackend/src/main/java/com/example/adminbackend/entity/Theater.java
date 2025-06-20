// src/main/java/com/example/adminbackend/entity/Theater.java
package com.example.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "theaters")
public class Theater {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic info
    private String name;
    private String location;
    private String city;
    private String address;
    private String state;
    private String pincode;
    private String phoneNumber;
    private String email;

    // Specs
    private Integer numberOfScreens;
    private Integer totalSeats;

    // Active/Inactive/etc.
    private String status;

    // e.g. M-Ticket, IMAX, etc.
    @ElementCollection
    @CollectionTable(
            name = "theater_facilities",
            joinColumns = @JoinColumn(name = "theater_id")
    )
    @Column(name = "facility")
    private List<String> facilities;

    // ← parent side of Theater ↔ Seat
    @OneToMany(mappedBy = "theater", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Seat> seats;

    public Theater() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getFacilities() { return facilities; }
    public void setFacilities(List<String> facilities) { this.facilities = facilities; }

    public List<Seat> getSeats() { return seats; }
    public void setSeats(List<Seat> seats) { this.seats = seats; }
}
