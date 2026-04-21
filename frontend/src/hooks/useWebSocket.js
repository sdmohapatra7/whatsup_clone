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
    const { currentUser, activeChat, addMessageOptimistically, setMessages, unreadCounts, setUnreadCount, setRecentMessages, setTyping, updateMessageStatus } = useChatStore();
    const stompClient = useRef(null);
    const typingSubscriptions = useRef({}); // { chatId: subscription }

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

                // 3. Subscribe to Typing (Personal)
                client.subscribe(`/user/${currentUser.username}/queue/typing`, (msg) => {
                    const data = JSON.parse(msg.body);
                    setTyping(data.userId, data.userId, data.isTyping);
                });

                // 4. Subscribe to Status (Seen/Read)
                client.subscribe(`/user/${currentUser.username}/queue/status`, (msg) => {
                    const data = JSON.parse(msg.body);
                    updateMessageStatus(data.partnerId, data.status);
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

    // Handle Group Typing Subscription
    useEffect(() => {
        if (stompClient.current?.active && activeChat?.isGroup) {
            const topic = `/topic/group/${activeChat.id}/typing`;
            const sub = stompClient.current.subscribe(topic, (msg) => {
                const data = JSON.parse(msg.body);
                if (data.userId !== currentUser.username) {
                    setTyping(activeChat.id, data.userId, data.isTyping);
                }
            });
            return () => sub.unsubscribe();
        }
    }, [activeChat, setTyping, currentUser]);

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

    /**
     * BROADCAST TYPING STATUS
     */
    const sendTyping = (isTyping) => {
        if (stompClient.current?.connected && activeChat) {
            const typingData = {
                senderId: currentUser.username,
                recipientId: activeChat.isGroup ? null : activeChat.username,
                groupId: activeChat.isGroup ? activeChat.id : null,
                isTyping
            };

            stompClient.current.publish({
                destination: '/app/chat/typing',
                body: JSON.stringify(typingData)
            });
        }
    };

    const sendReadReceipt = (partnerId) => {
        if (stompClient.current?.connected && partnerId) {
            stompClient.current.publish({
                destination: '/app/chat/read',
                body: JSON.stringify({
                    senderId: partnerId,
                    recipientId: currentUser.username
                })
            });
        }
    };

    return { sendMessage, sendTyping, sendReadReceipt };
}
