package com.whatsapp.clone.config;

import com.whatsapp.clone.model.Status;
import com.whatsapp.clone.model.User;
import com.whatsapp.clone.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.Optional;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    private final SimpMessageSendingOperations messagingTemplate;
    private final UserRepository userRepository;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = (headerAccessor.getUser() != null) ? headerAccessor.getUser().getName() : null;
        
        if (userId != null) {
            logger.info("User connected: {}", userId);
            updateUserStatus(userId, Status.ONLINE);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = (headerAccessor.getUser() != null) ? headerAccessor.getUser().getName() : null;

        if (userId != null) {
            logger.info("User disconnected: {}", userId);
            updateUserStatus(userId, Status.OFFLINE);
        }
    }

    private void updateUserStatus(String userId, Status status) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(status);
            userRepository.save(user);

            // Broadcast status change to all users
            messagingTemplate.convertAndSend("/topic/public", Map.of(
                    "userId", userId,
                    "status", status.toString()
            ));
        }
    }
}
