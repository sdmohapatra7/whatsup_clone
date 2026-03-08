package com.whatsapp.clone.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username; // Retained for backwards compatibility in existing messages, though phoneNumber
                             // is primary.
    private String phoneNumber;
    private String email;
    private String fullName;
    private String profileImageUrl;
    private Status status;
    private boolean twoStepEnabled;
    private String twoStepPin;
}
