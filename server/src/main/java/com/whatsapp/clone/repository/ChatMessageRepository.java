package com.whatsapp.clone.repository;

import com.whatsapp.clone.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySenderIdAndRecipientId(String senderId, String recipientId);

    List<ChatMessage> findBySenderIdOrRecipientId(String senderId, String recipientId);
    
    List<ChatMessage> findByGroupId(String groupId);

    void deleteByExpiresAtBefore(LocalDateTime now);
}
