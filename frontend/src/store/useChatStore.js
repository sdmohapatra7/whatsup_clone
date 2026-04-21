import { create } from 'zustand';

/**
 * ADVANCED STATE CONCEPTS: 
 * implementing Optimistic UI Updates, Persistent Session logic, 
 * and Centralized Feedback management.
 */
const useChatStore = create((set, get) => ({
    currentUser: JSON.parse(localStorage.getItem('chatSession')) || null,
    activeChat: null,
    messages: [],
    users: [],
    groups: [],
    recentMessages: [],
    unreadCounts: {},
    typingUsers: {}, // { chatId: [userIds...] }
    toast: null,
 
    setTyping: (chatId, userId, isTyping) => {
        set(state => {
            const currentTyping = state.typingUsers[chatId] || [];
            let newTyping;
            if (isTyping) {
                if (currentTyping.includes(userId)) return state;
                newTyping = [...currentTyping, userId];
            } else {
                newTyping = currentTyping.filter(id => id !== userId);
            }
            return {
                typingUsers: { ...state.typingUsers, [chatId]: newTyping }
            };
        });
    },

    // ADVANCED: Centralized State Transitions
    setCurrentUser: (user) => {
        if (user) localStorage.setItem('chatSession', JSON.stringify(user));
        else localStorage.removeItem('chatSession');
        set({ currentUser: user });
    },

    setActiveChat: (chat) => {
        // Advanced: Clear unread counts optimistically when opening a chat
        if (chat) {
            const id = chat.isGroup ? chat.id : chat.username;
            set(state => ({
                activeChat: chat,
                unreadCounts: { ...state.unreadCounts, [id]: 0 }
            }));
        } else {
            set({ activeChat: null });
        }
    },

    setMessages: (messages) => set({ messages }),
    
    // ADVANCED: Optimistic UI Update
    // Call this before server confirms to make the UI feel instantaneous
    addMessageOptimistically: (msg) => {
        set(state => ({
            messages: [...state.messages, {
                ...msg,
                id: 'temp-' + Date.now(),
                timestamp: new Date().toISOString(),
                status: 'SENDING' // Visual feedback for optimistic state
            }]
        }));
    },

    setUsers: (users) => set({ users }),
    setGroups: (groups) => set({ groups }),
    setRecentMessages: (recentMessages) => set({ recentMessages }),
    
    setUnreadCount: (id, count) => set(state => ({
        unreadCounts: { ...state.unreadCounts, [id]: count }
    })),

    // Advanced Notification Management
    showToast: (message, type = 'success') => {
        const id = Date.now();
        set({ toast: { id, message, type } });
        setTimeout(() => {
            if (get().toast?.id === id) set({ toast: null });
        }, 4000);
    }
}));

export default useChatStore;
