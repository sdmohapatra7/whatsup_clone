import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import useChatStore from '../store/useChatStore';

/**
 * ADVANCED HOOK CONCEPTS:
 * Robust Connection Lifecycle Management, Auto-Reconnection,
 * and Optimistic Synchronization logic.
 */
export default function useWebSocket() {
    const { currentUser, activeChat, addMessageOptimistically, setMessages, unreadCounts, setUnreadCount, setRecentMessages } = useChatStore();
    const stompClient = useRef(null);

    const connect = useCallback(() => {
        if (!currentUser) return;

        const socket = new SockJS('http://localhost:8082/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Advanced Mesh Connected');
                
                // 1. Subscribe to Personal Queue
                client.subscribe(`/user/${currentUser.username}/queue/messages`, (msg) => {
                    const newMsg = JSON.parse(msg.body);
                    handleIncomingMessage(newMsg);
                });

                // 2. Subscribe to Public Status (ONLINE/OFFLINE)
                client.subscribe('/topic/public', (msg) => {
                    // Update user status in state if needed
                });
            }
        });

        client.activate();
        stompClient.current = client;
    }, [currentUser]);

    const handleIncomingMessage = (newMsg) => {
        const { messages, activeChat, setMessages, showToast } = useChatStore.getState();
        
        // If message is for the currently open chat, add it immediately
        const isFromActiveChat = activeChat && 
            (newMsg.groupId === activeChat.id || newMsg.senderId === activeChat.username);

        if (isFromActiveChat) {
            setMessages([...messages, newMsg]);
        } else {
            // Increment unread count logic
            const id = newMsg.groupId || newMsg.senderId;
            setUnreadCount(id, (unreadCounts[id] || 0) + 1);
            showToast(`Encrypted signal from ${newMsg.senderId}`);
        }
    };

    useEffect(() => {
        connect();
        return () => stompClient.current?.deactivate();
    }, [connect]);

    /**
     * ADVANCED: Optimistic Send Logic
     */
    const sendMessage = (content, mediaUrl = null, messageType = 'TEXT') => {
        if (stompClient.current?.connected && activeChat) {
            const messageData = {
                senderId: currentUser.username,
                recipientId: activeChat.memberIds ? null : activeChat.username,
                groupId: activeChat.memberIds ? activeChat.id : null,
                content,
                mediaUrl,
                messageType,
                timestamp: new Date().toISOString()
            };

            // OPTIMISTIC UPDATE: Update UI before the signal reaches the satellite
            addMessageOptimistically(messageData);

            stompClient.current.publish({
                destination: '/app/chat',
                body: JSON.stringify(messageData)
            });
        }
    };

    return { sendMessage };
}
