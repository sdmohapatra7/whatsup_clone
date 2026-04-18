import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Auth from './Auth';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ProfileSettings from './ProfileSettings';

function ChatApp({ currentUser, setCurrentUser }) {
    const [users, setUsers] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [recentMessages, setRecentMessages] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const stompClient = useRef(null);

    // Fetch users and recent messages
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [usersRes, recentRes] = await Promise.all([
                    fetch('http://localhost:8082/api/users'),
                    fetch(`http://localhost:8082/api/messages/recent/${currentUser.username}`)
                ]);

                if (usersRes.ok) setUsers(await usersRes.json());
                if (recentRes.ok) setRecentMessages(await recentRes.json());
            } catch (err) {
                console.error("Error fetching initial data", err);
            }
        };

        fetchInitialData();
        // Poll for new users (simple implementation)
        const interval = setInterval(fetchInitialData, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // Connect WebSocket
    useEffect(() => {
        const socket = new SockJS('http://localhost:8082/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/user/${currentUser.username}/queue/messages`, (message) => {
                    const receivedMsg = JSON.parse(message.body);

                    // Update current chat if it's from the active chat
                    setMessages(prev => {
                        // We need to check activeChat ref or use function state to avoid stale closure
                        // A simple approach is just unconditionally adding to messages list if it matches activeChat
                        // In a real app we'd want to be more careful, but this works if we re-render
                        return [...prev, receivedMsg];
                    });

                    // Also update recent messages
                    setRecentMessages(prev => {
                        const others = prev.filter(m =>
                            !(m.senderId === receivedMsg.senderId && m.recipientId === receivedMsg.recipientId) &&
                            !(m.senderId === receivedMsg.recipientId && m.recipientId === receivedMsg.senderId)
                        );
                        return [receivedMsg, ...others];
                    });
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [currentUser]);

    // Fetch messages when activeChat changes or periodically
    useEffect(() => {
        if (!activeChat) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`http://localhost:8082/api/messages/${currentUser.username}/${activeChat.username}`);
                if (res.ok) {
                    setMessages(await res.json());
                }
            } catch (err) {
                console.error("Could not fetch messages", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 15000);
        return () => clearInterval(interval);
    }, [activeChat, currentUser]);

    // Filter messages to only show those for the active chat
    const displayMessages = messages.filter(m =>
        (m.senderId === currentUser.username && m.recipientId === activeChat?.username) ||
        (m.senderId === activeChat?.username && m.recipientId === currentUser.username)
    );

    const handleSendMessage = (content, messageType = 'TEXT', mediaUrl = null, disappears = false) => {
        if (!activeChat || !stompClient.current) return;

        const chatMessage = {
            senderId: currentUser.username || currentUser.phoneNumber,
            recipientId: activeChat.username || activeChat.phoneNumber,
            content: content,
            messageType: messageType,
            mediaUrl: mediaUrl,
            status: 'DELIVERED',
            disappears: disappears
        };

        stompClient.current.publish({
            destination: '/app/chat',
            body: JSON.stringify(chatMessage),
        });

        // Optimistic update
        const optimisticMsg = { ...chatMessage, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, optimisticMsg]);

        // Update recent messages
        setRecentMessages(prev => {
            const others = prev.filter(m =>
                !(m.senderId === optimisticMsg.senderId && m.recipientId === optimisticMsg.recipientId) &&
                !(m.senderId === optimisticMsg.recipientId && m.recipientId === optimisticMsg.senderId)
            );
            return [optimisticMsg, ...others];
        });
    };

    const handleLogout = async () => {
        try {
            await fetch(`http://localhost:8082/api/users/logout/${currentUser.username}`, { method: 'POST' });
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('chatUser');
        setCurrentUser(null);
    };

    return (
        <div className="flex bg-[#f0f2f5] min-h-screen py-5 px-[5%]">
            <div className="flex w-full h-[calc(100vh-40px)] max-w-[1600px] mx-auto bg-white rounded-md shadow-2xl overflow-hidden">
                <Sidebar
                    currentUser={currentUser}
                    users={users}
                    activeChat={activeChat}
                    setActiveChat={setActiveChat}
                    recentMessages={recentMessages}
                    onLogout={handleLogout}
                    onOpenProfile={() => setShowProfile(true)}
                />
                <ChatWindow
                    currentUser={currentUser}
                    activeChat={activeChat}
                    messages={displayMessages}
                    onSendMessage={handleSendMessage}
                />

                {showProfile && (
                    <ProfileSettings
                        currentUser={currentUser}
                        setUser={setCurrentUser}
                        onClose={() => setShowProfile(false)}
                    />
                )}
            </div>
        </div>
    );
}

function App() {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('chatUser');
        return saved ? JSON.parse(saved) : null;
    });

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        currentUser
                            ? <ChatApp currentUser={currentUser} setCurrentUser={setCurrentUser} />
                            : <Navigate to="/auth" />
                    }
                />
                <Route
                    path="/auth"
                    element={
                        !currentUser
                            ? <Auth setUser={setCurrentUser} />
                            : <Navigate to="/" />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
