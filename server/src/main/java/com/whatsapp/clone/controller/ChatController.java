package com.whatsapp.clone.controller;

import com.whatsapp.clone.model.ChatMessage;
import com.whatsapp.clone.repository.ChatMessageRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;

import com.whatsapp.clone.model.MessageStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
    }

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setStatus(MessageStatus.DELIVERED);
        
        if (Boolean.TRUE.equals(chatMessage.getDisappears())) {
            chatMessage.setExpiresAt(LocalDateTime.now().plusHours(24));
        }

        ChatMessage savedMsg = chatMessageRepository.save(chatMessage);

        if (chatMessage.getGroupId() != null) {
            // Group Message: Broadcast to the group topic
            messagingTemplate.convertAndSend("/topic/group/" + chatMessage.getGroupId(), savedMsg);
        } else {
            // Private Message: Broadcast to the specific user's queue
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getRecipientId(), "/queue/messages", savedMsg);
        }
    }

    @MessageMapping("/chat/read")
    public void processReadReceipt(@Payload Map<String, String> payload) {
        String senderId = payload.get("senderId"); // The person who sent the messages
        String recipientId = payload.get("recipientId"); // The person who just read them

        List<ChatMessage> unreadMessages = chatMessageRepository.findBySenderIdAndRecipientId(senderId, recipientId)
                .stream()
                .filter(m -> m.getStatus() != MessageStatus.READ)
                .toList();

        if (!unreadMessages.isEmpty()) {
            unreadMessages.forEach(m -> m.setStatus(MessageStatus.READ));
            chatMessageRepository.saveAll(unreadMessages);

            // Notify the SENDER that their messages were read
            messagingTemplate.convertAndSendToUser(
                    senderId, "/queue/status", Map.of(
                            "partnerId", recipientId,
                            "status", "READ"
                    ));
        }
    }

    @MessageMapping("/chat/typing")
    public void processTyping(@Payload Map<String, String> payload) {
        String senderId = payload.get("senderId");
        String recipientId = payload.get("recipientId");
        String groupId = payload.get("groupId");
        boolean isTyping = Boolean.parseBoolean(String.valueOf(payload.get("isTyping")));

        Map<String, Object> response = new HashMap<>();
        response.put("userId", senderId);
        response.put("isTyping", isTyping);

        if (groupId != null) {
            messagingTemplate.convertAndSend("/topic/group/" + groupId + "/typing", response);
        } else if (recipientId != null) {
            messagingTemplate.convertAndSendToUser(recipientId, "/queue/typing", response);
        }
    }

    @GetMapping("/api/messages/group/{groupId}")
    @ResponseBody
    public ResponseEntity<List<ChatMessage>> findGroupMessages(@PathVariable("groupId") String groupId) {
        List<ChatMessage> messages = chatMessageRepository.findByGroupId(groupId);
        
        List<ChatMessage> result = messages.stream()
            .filter(m -> m.getExpiresAt() == null || m.getExpiresAt().isAfter(LocalDateTime.now()))
            .sorted(Comparator.comparing(ChatMessage::getTimestamp))
            .toList();

        return ResponseEntity.ok(result);
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
