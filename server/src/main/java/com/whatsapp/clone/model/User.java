package com.whatsapp.clone.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String phoneNumber;
    private String email;
    private String fullName;
    private String profileImageUrl;
    private Status status;
    private boolean twoStepEnabled;
    private String twoStepPin;

    public User() {}

    public User(String id, String username, String phoneNumber, String email, String fullName, String profileImageUrl, Status status, boolean twoStepEnabled, String twoStepPin) {
        this.id = id;
        this.username = username;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.fullName = fullName;
        this.profileImageUrl = profileImageUrl;
        this.status = status;
        this.twoStepEnabled = twoStepEnabled;
        this.twoStepPin = twoStepPin;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public boolean isTwoStepEnabled() { return twoStepEnabled; }
    public void setTwoStepEnabled(boolean twoStepEnabled) { this.twoStepEnabled = twoStepEnabled; }
    public String getTwoStepPin() { return twoStepPin; }
    public void setTwoStepPin(String twoStepPin) { this.twoStepPin = twoStepPin; }

    public static class UserBuilder {
        private String id;
        private String username;
        private String phoneNumber;
        private String email;
        private String fullName;
        private String profileImageUrl;
        private Status status;
        private boolean twoStepEnabled;
        private String twoStepPin;

        public UserBuilder id(String id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserBuilder profileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; return this; }
        public UserBuilder status(Status status) { this.status = status; return this; }
        public UserBuilder twoStepEnabled(boolean twoStepEnabled) { this.twoStepEnabled = twoStepEnabled; return this; }
        public UserBuilder twoStepPin(String twoStepPin) { this.twoStepPin = twoStepPin; return this; }

        public User build() {
            return new User(id, username, phoneNumber, email, fullName, profileImageUrl, status, twoStepEnabled, twoStepPin);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
