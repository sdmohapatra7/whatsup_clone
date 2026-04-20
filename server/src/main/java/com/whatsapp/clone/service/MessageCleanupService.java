package com.whatsapp.clone.service;

import com.whatsapp.clone.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MessageCleanupService {

    private static final Logger log = LoggerFactory.getLogger(MessageCleanupService.class);
    private final ChatMessageRepository chatMessageRepository;

    public MessageCleanupService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    /**
     * Runs every minute to delete messages that have expired.
     */
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredMessages() {
        log.info("Running cleanup task for expired messages...");
        chatMessageRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
