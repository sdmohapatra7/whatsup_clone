package com.whatsapp.clone.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "messages")
public class ChatMessage {
    @Id
    private String id;
    private String senderId;
    private String recipientId;
    private String groupId;
    private String content;
    private String mediaUrl;
    private MessageType messageType;
    private LocalDateTime timestamp;
    private MessageStatus status;
    private Boolean disappears;
    private LocalDateTime expiresAt;

    public ChatMessage() {}

    public ChatMessage(String id, String senderId, String recipientId, String groupId, String content, String mediaUrl, MessageType messageType, LocalDateTime timestamp, MessageStatus status, Boolean disappears, LocalDateTime expiresAt) {
        this.id = id;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.groupId = groupId;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.messageType = messageType;
        this.timestamp = timestamp;
        this.status = status;
        this.disappears = disappears;
        this.expiresAt = expiresAt;
    }

    public static ChatMessageBuilder builder() {
        return new ChatMessageBuilder();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }
    public Boolean getDisappears() { return disappears; }
    public void setDisappears(Boolean disappears) { this.disappears = disappears; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public static class ChatMessageBuilder {
        private String id;
        private String senderId;
        private String recipientId;
        private String groupId;
        private String content;
        private String mediaUrl;
        private MessageType messageType;
        private LocalDateTime timestamp;
        private MessageStatus status;
        private Boolean disappears;
        private LocalDateTime expiresAt;

        public ChatMessageBuilder id(String id) { this.id = id; return this; }
        public ChatMessageBuilder senderId(String senderId) { this.senderId = senderId; return this; }
        public ChatMessageBuilder recipientId(String recipientId) { this.recipientId = recipientId; return this; }
        public ChatMessageBuilder groupId(String groupId) { this.groupId = groupId; return this; }
        public ChatMessageBuilder content(String content) { this.content = content; return this; }
        public ChatMessageBuilder mediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; return this; }
        public ChatMessageBuilder messageType(MessageType messageType) { this.messageType = messageType; return this; }
        public ChatMessageBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public ChatMessageBuilder status(MessageStatus status) { this.status = status; return this; }
        public ChatMessageBuilder disappears(Boolean disappears) { this.disappears = disappears; return this; }
        public ChatMessageBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }

        public ChatMessage build() {
            return new ChatMessage(id, senderId, recipientId, groupId, content, mediaUrl, messageType, timestamp, status, disappears, expiresAt);
        }
    }
}
