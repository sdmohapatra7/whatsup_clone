package com.whatsapp.clone.service;

import com.whatsapp.clone.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageCleanupService {

    private final ChatMessageRepository chatMessageRepository;

    /**
     * Runs every minute to delete messages that have expired.
     */
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredMessages() {
        log.info("Running cleanup task for expired messages...");
        chatMessageRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
