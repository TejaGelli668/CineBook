//package com.example.adminbackend.dto;
//
//import jakarta.validation.constraints.Email;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.Size;
//
//public class UserRegistrationRequest {
//
//    @NotBlank(message = "Email is required")
//    @Email(message = "Please provide a valid email")
//    private String email;
//
//    @NotBlank(message = "Password is required")
//    @Size(min = 6, message = "Password must be at least 6 characters")
//    private String password;
//
//    @NotBlank(message = "First name is required")
//    private String firstName;
//
//    @NotBlank(message = "Last name is required")
//    private String lastName;
//
//    private Birthday birthday;
//
//    // Constructors
//    public UserRegistrationRequest() {}
//
//    public UserRegistrationRequest(String email, String password, String firstName, String lastName, Birthday birthday) {
//        this.email = email;
//        this.password = password;
//        this.firstName = firstName;
//        this.lastName = lastName;
//        this.birthday = birthday;
//    }
//
//    // Getters and Setters
//    public String getEmail() { return email; }
//    public void setEmail(String email) { this.email = email; }
//
//    public String getPassword() { return password; }
//    public void setPassword(String password) { this.password = password; }
//
//    public String getFirstName() { return firstName; }
//    public void setFirstName(String firstName) { this.firstName = firstName; }
//
//    public String getLastName() { return lastName; }
//    public void setLastName(String lastName) { this.lastName = lastName; }
//
//    public Birthday getBirthday() { return birthday; }
//    public void setBirthday(Birthday birthday) { this.birthday = birthday; }
//
//    // Inner class for birthday
//    public static class Birthday {
//        private int year;
//        private int month;
//        private int day;
//
//        public Birthday() {}
//
//        public Birthday(int year, int month, int day) {
//            this.year = year;
//            this.month = month;
//            this.day = day;
//        }
//
//        // Getters and Setters
//        public int getYear() { return year; }
//        public void setYear(int year) { this.year = year; }
//
//        public int getMonth() { return month; }
//        public void setMonth(int month) { this.month = month; }
//
//        public int getDay() { return day; }
//        public void setDay(int day) { this.day = day; }
//    }
//}
package com.example.adminbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserRegistrationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phoneNumber;

    private Birthday birthday;

    // Constructors
    public UserRegistrationRequest() {}

    public UserRegistrationRequest(String email, String password, String firstName,
                                   String lastName, String phoneNumber, Birthday birthday) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.birthday = birthday;
    }

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Birthday getBirthday() { return birthday; }
    public void setBirthday(Birthday birthday) { this.birthday = birthday; }

    // Inner class for birthday
    public static class Birthday {
        private int year;
        private int month;
        private int day;

        public Birthday() {}

        public Birthday(int year, int month, int day) {
            this.year = year;
            this.month = month;
            this.day = day;
        }

        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }

        public int getMonth() { return month; }
        public void setMonth(int month) { this.month = month; }

        public int getDay() { return day; }
        public void setDay(int day) { this.day = day; }

        @Override
        public String toString() {
            return "Birthday{" +
                    "year=" + year +
                    ", month=" + month +
                    ", day=" + day +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "UserRegistrationRequest{" +
                "email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", birthday=" + birthday +
                '}';
    }
}