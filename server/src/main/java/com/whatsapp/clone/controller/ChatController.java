package com.whatsapp.clone.controller;

import com.whatsapp.clone.model.ChatMessage;
import com.whatsapp.clone.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        
        if (Boolean.TRUE.equals(chatMessage.getDisappears())) {
            // Set message to expire in 24 hours (or 1 minute for quick testing if you prefer)
            chatMessage.setExpiresAt(LocalDateTime.now().plusHours(24));
        }

        ChatMessage savedMsg = chatMessageRepository.save(chatMessage);

        // Broadcasts to the specific user's queue: /user/{recipientId}/queue/messages
        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipientId(), "/queue/messages", savedMsg);
    }

    @GetMapping("/api/messages/{senderId}/{recipientId}")
    @ResponseBody
    public ResponseEntity<List<ChatMessage>> findChatMessages(@PathVariable("senderId") String senderId,
            @PathVariable("recipientId") String recipientId) {
        // Find messages where A sends to B OR B sends to A
        List<ChatMessage> aToB = chatMessageRepository.findBySenderIdAndRecipientId(senderId, recipientId);
        List<ChatMessage> bToA = chatMessageRepository.findBySenderIdAndRecipientId(recipientId, senderId);

        List<ChatMessage> allMessages = new ArrayList<>();
        allMessages.addAll(aToB);
        allMessages.addAll(bToA);

        // Sort by timestamp and filter out expired ones
        List<ChatMessage> result = allMessages.stream()
            .filter(m -> m.getExpiresAt() == null || m.getExpiresAt().isAfter(LocalDateTime.now()))
            .sorted(Comparator.comparing(ChatMessage::getTimestamp))
            .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/messages/recent/{userId}")
    @ResponseBody
    public ResponseEntity<List<ChatMessage>> findRecentMessages(@PathVariable("userId") String userId) {
        List<ChatMessage> allUserMessages = chatMessageRepository.findBySenderIdOrRecipientId(userId, userId);

        // Group by conversation partner
        Map<String, ChatMessage> recentMessages = new HashMap<>();

        for (ChatMessage msg : allUserMessages) {
            String partnerId = msg.getSenderId().equals(userId) ? msg.getRecipientId() : msg.getSenderId();

            if (!recentMessages.containsKey(partnerId)) {
                recentMessages.put(partnerId, msg);
            } else {
                ChatMessage existing = recentMessages.get(partnerId);
                if (msg.getTimestamp() != null && existing.getTimestamp() != null) {
                    if (msg.getTimestamp().isAfter(existing.getTimestamp())) {
                        recentMessages.put(partnerId, msg);
                    }
                }
            }
        }

        List<ChatMessage> result = recentMessages.values().stream()
                .filter(m -> m.getExpiresAt() == null || m.getExpiresAt().isAfter(LocalDateTime.now()))
                .sorted(Comparator.comparing(ChatMessage::getTimestamp).reversed())
                .toList();

        return ResponseEntity.ok(result);
    }
}
