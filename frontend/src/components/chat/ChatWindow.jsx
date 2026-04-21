import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import EmojiPicker from 'emoji-picker-react';
import useChatStore from '../../store/useChatStore';

// Optimized Message Component with Memoization
const MessageItem = memo(({ msg, isMine, isGroupChat }) => {
    const time = useMemo(() => {
        return msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    }, [msg.timestamp]);

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-entrance`}>
            <div className="flex flex-col max-w-[85%] lg:max-w-[70%]">
                {isGroupChat && !isMine && (
                    <span className="text-[10px] font-black text-[#25d366] mb-2 uppercase tracking-[2px] ml-4">{msg.senderId}</span>
                )}
                <div className={`relative px-4 py-3 shadow-2xl transition-all ${isMine ? 'bg-[#005c4b] text-white rounded-[28px] rounded-br-none border border-white/5' : 'bg-[#202c33] text-gray-100 rounded-[28px] rounded-bl-none border border-white/5'}`}>
                    
                    {/* Media Rendering Logic */}
                    {msg.messageType === 'IMAGE' && msg.mediaUrl && (
                        <div className="mb-2 rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                            <img 
                                src={msg.mediaUrl} 
                                alt="Shared media" 
                                className="max-w-full max-h-[300px] object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                loading="lazy"
                            />
                        </div>
                    )}
                    {msg.messageType === 'VIDEO' && msg.mediaUrl && (
                        <div className="mb-2 rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                            <video 
                                src={msg.mediaUrl} 
                                controls 
                                className="max-w-full max-h-[300px]"
                                preload="metadata"
                            />
                        </div>
                    )}

                    {msg.content && <p className="text-[15px] font-medium leading-relaxed tracking-tight break-words">{msg.content}</p>}
                    
                    <div className="flex items-center justify-end space-x-2 mt-1 opacity-40">
                        <span className="text-[9px] font-black uppercase">{time}</span>
                        {isMine && (
                            <div className="flex -space-x-1 text-[#25d366]">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default function ChatWindow({ onSendMessage, onBack }) {
    const { currentUser, activeChat, messages } = useChatStore();
    const [inputMessage, setInputMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Smooth Scroll Optimization
    useEffect(() => { 
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    const handleSend = useCallback((e) => {
        if (e) e.preventDefault();
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
            setShowEmojiPicker(false);
        }
    }, [inputMessage, onSendMessage]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const type = file.type.startsWith('image/') ? 'chat-image' : 'chat-video';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const res = await fetch('http://localhost:8082/api/files/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('chatToken')}` },
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                // Send specific message type for media
                onSendMessage('', data.url, type === 'chat-image' ? 'IMAGE' : 'VIDEO');
            }
        } catch (err) { console.error('Upload failed', err); }
        finally { setIsUploading(false); }
    };

    if (!activeChat) {
        return (
            <div className="flex-1 bg-[#0a0e11] flex flex-col items-center justify-center relative px-8 text-center text-[#8696a0] h-full overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] grayscale pointer-events-none" style={{ backgroundImage: "url('https://i.pinimg.com/originals/f5/00/ec/f500ecf831968875567f70b7407842c8.png')", backgroundSize: '400px' }}></div>
                <div className="relative z-10 transition-all duration-700">
                    <div className="w-28 h-28 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-[38px] flex items-center justify-center mx-auto mb-10 shadow-[0_20px_50px_rgba(37,211,102,0.2)] border border-white/5 rotate-12">
                        <svg className="w-14 h-14 text-[#111b21]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
                    </div>
                    <h1 className="text-4xl font-black text-gray-100 mb-2 uppercase tracking-tighter italic">WhatsApp <span className="text-[#25d366]">Pro</span></h1>
                    <p className="text-[11px] font-black uppercase tracking-[6px] text-white/20">End-to-End Encryption Active</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0a0e11] relative h-full">
            <div className="absolute inset-0 opacity-[0.02] grayscale pointer-events-none" style={{ backgroundImage: "url('https://i.pinimg.com/originals/f5/00/ec/f500ecf831968875567f70b7407842c8.png')", backgroundSize: '400px' }}></div>
            
            <div className="h-20 flex items-center justify-between px-8 bg-[#202c33]/80 backdrop-blur-3xl z-20 shrink-0 border-b border-white/5">
                <div className="flex items-center space-x-5">
                    <button onClick={onBack} className="md:hidden text-[#25d366] p-2 -ml-3 hover:bg-white/5 rounded-xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center text-black font-black text-xl shadow-lg border border-white/5">
                        {(activeChat.name || activeChat.fullName || activeChat.phoneNumber || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-black text-gray-100 text-[15px] leading-tight tracking-tight truncate">{activeChat.name || activeChat.fullName || activeChat.phoneNumber}</h2>
                        <div className="flex items-center mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${activeChat.status === 'ONLINE' ? 'bg-[#25d366] shadow-[0_0_5px_#25d366]' : 'bg-gray-600'}`}></span>
                            <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">{activeChat.status === 'ONLINE' ? 'Secured' : 'Offline'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-8 z-10 scroll-smooth">
                {messages.map((msg, idx) => {
                    const isMine = msg.senderId === currentUser.username || msg.senderId === currentUser.phoneNumber;
                    return (
                        <MessageItem 
                            key={msg.id || idx} 
                            msg={msg} 
                            isMine={isMine} 
                            isGroupChat={!!activeChat.memberIds} 
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 md:p-8 bg-gradient-to-t from-[#0a0e11] via-[#0a0e11] to-transparent z-20">
                <div className="max-w-5xl mx-auto flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-4 text-[#8696a0] hover:text-[#25d366] bg-[#202c33] rounded-[24px] shadow-lg transition-all active:scale-95"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-5-11a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm10 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-5 7c-2.33 0-4.31-1.46-5.11-3.5h1.12c.7 1.44 2.19 2.5 3.99 2.5s3.29-1.06 3.99-2.5h1.12c-.8 2.04-2.78 3.5-5.11 3.5z"/></svg></button>
                        
                        <button onClick={() => fileInputRef.current?.click()} className="p-4 text-[#8696a0] hover:text-[#25d366] bg-[#202c33] rounded-[24px] shadow-lg transition-all active:scale-95">
                            {isUploading ? (
                                <div className="w-6 h-6 border-2 border-[#25d366]/20 border-t-[#25d366] rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" /></svg>
                            )}
                        </button>
                        <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
                    </div>

                    <form onSubmit={handleSend} className="flex-1 flex items-center bg-[#2a3942] rounded-[32px] px-8 py-1 shadow-2xl border-2 border-white/5 focus-within:border-[#25d366]/40 transition-all">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type an encrypted message..."
                            className="flex-1 bg-transparent border-none outline-none text-gray-100 py-4 font-bold text-[15px] placeholder:text-gray-600"
                        />
                        <button type="submit" disabled={!inputMessage.trim()} className="ml-4 text-[#25d366] disabled:opacity-5 transition-all hover:scale-110 active:scale-95 p-2 bg-white/5 rounded-2xl">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/></svg>
                        </button>
                    </form>
                </div>
            </div>
            
            {showEmojiPicker && (
                <div className="fixed inset-0 md:absolute md:inset-auto md:bottom-32 md:left-10 z-50 flex items-center justify-center md:block p-4 md:p-0">
                    <div className="md:fixed inset-0 md:hidden bg-black/40 backdrop-blur-sm" onClick={() => setShowEmojiPicker(false)}></div>
                    <div className="relative z-10 w-full max-w-[350px] md:max-w-none animate-entrance shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-[32px] overflow-hidden border border-white/10 bg-[#111b21]">
                        <EmojiPicker 
                            theme="dark" 
                            width="100%"
                            height={400}
                            onEmojiClick={(e) => {
                                setInputMessage(p => p + e.emoji);
                                if (window.innerWidth < 768) setShowEmojiPicker(false);
                            }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
