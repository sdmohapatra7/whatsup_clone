package com.whatsapp.clone.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "otps")
public class Otp {
    @Id
    private String id;
    private String phoneNumber;
    private String otpCode;
    private LocalDateTime expirationTime;
}
