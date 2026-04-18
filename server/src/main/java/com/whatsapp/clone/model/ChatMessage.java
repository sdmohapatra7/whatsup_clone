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
@Document(collection = "messages")
public class ChatMessage {
    @Id
    private String id;
    private String senderId;
    private String recipientId;
    private String content;
    private String mediaUrl;
    private MessageType messageType;
    private LocalDateTime timestamp;
    private MessageStatus status;
    private Boolean disappears;
    private LocalDateTime expiresAt;
}

enum MessageStatus {
    RECEIVED, DELIVERED
}

enum MessageType {
    TEXT, IMAGE, VIDEO
}
