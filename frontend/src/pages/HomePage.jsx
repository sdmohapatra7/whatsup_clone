import { useEffect } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import useChatStore from '../store/useChatStore';
import useWebSocket from '../hooks/useWebSocket';
import { api } from '../services/api';

const HomePage = () => {
    const { currentUser, setCurrentUser, activeChat, setActiveChat, setMessages, setUsers, setGroups, setRecentMessages, toast } = useChatStore();
    const { sendMessage } = useWebSocket();

    useEffect(() => {
        if (!currentUser) return;
        const fetchInitialData = async () => {
            try {
                const [uData, gData, rData] = await Promise.all([
                    api.get('/users'),
                    api.get(`/groups/user/${currentUser.id}`),
                    api.get(`/messages/recent/${encodeURIComponent(currentUser.username)}`)
                ]);
                setUsers(uData);
                setGroups(gData);
                setRecentMessages(rData);
            } catch (err) { console.error(err); }
        };
        fetchInitialData();
    }, [currentUser]);

    useEffect(() => {
        if (!activeChat) return;
        const fetchMessages = async () => {
            // FIXED: Removed the incorrect '/chat/' segment from the URL
            // and added encodeURIComponent to handle characters like '+' in phone numbers.
            const url = activeChat.memberIds 
                ? `/messages/group/${activeChat.id}`
                : `/messages/${encodeURIComponent(currentUser.username)}/${encodeURIComponent(activeChat.username)}`;
            try {
                const data = await api.get(url);
                setMessages(data);
            } catch (err) { console.error(err); }
        };
        fetchMessages();
    }, [activeChat, currentUser.username]);

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('chatToken');
    };

    return (
        <div className="flex bg-[#0a0e11] min-h-screen selection:bg-[#25d366]/30">
            <div className="flex w-full h-screen mx-auto overflow-hidden relative">
                {/* Fixed Overlay Background Glows */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#25d366]/5 rounded-full blur-[150px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#25d366]/3 rounded-full blur-[100px]"></div>
                </div>

                <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] lg:w-[450px] flex-shrink-0 relative z-10`}>
                    <Sidebar onLogout={handleLogout} />
                </div>

                <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 h-full bg-[#0a0e11]/30 backdrop-blur-3xl relative z-10`}>
                    <ChatWindow onSendMessage={sendMessage} onBack={() => setActiveChat(null)} />
                </div>

                {toast && (
                    <div className="fixed bottom-12 right-12 z-[100] px-8 py-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-[#25d366]/30 bg-[#111b21] flex items-center space-x-4 animate-bounce">
                        <div className="w-8 h-8 bg-[#25d366] rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        </div>
                        <div>
                           <p className="font-black text-xs text-[#25d366] uppercase tracking-widest">Protocol Success</p>
                           <p className="text-[10px] text-white/40 font-bold">{toast.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
