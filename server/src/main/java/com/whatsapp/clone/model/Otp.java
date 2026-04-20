package com.whatsapp.clone.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "otps")
public class Otp {
    @Id
    private String id;
    private String phoneNumber;
    private String otpCode;
    private LocalDateTime expirationTime;

    public Otp() {}

    public Otp(String id, String phoneNumber, String otpCode, LocalDateTime expirationTime) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.otpCode = otpCode;
        this.expirationTime = expirationTime;
    }

    public static OtpBuilder builder() {
        return new OtpBuilder();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public LocalDateTime getExpirationTime() { return expirationTime; }
    public void setExpirationTime(LocalDateTime expirationTime) { this.expirationTime = expirationTime; }

    public static class OtpBuilder {
        private String id;
        private String phoneNumber;
        private String otpCode;
        private LocalDateTime expirationTime;

        public OtpBuilder id(String id) { this.id = id; return this; }
        public OtpBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public OtpBuilder otpCode(String otpCode) { this.otpCode = otpCode; return this; }
        public OtpBuilder expirationTime(LocalDateTime expirationTime) { this.expirationTime = expirationTime; return this; }

        public Otp build() {
            return new Otp(id, phoneNumber, otpCode, expirationTime);
        }
    }
}
