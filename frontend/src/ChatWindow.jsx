import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function ChatWindow({ currentUser, activeChat, messages, onSendMessage }) {
    const [inputMessage, setInputMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            onSendMessage(inputMessage, 'TEXT', null);
            setInputMessage('');
            setShowEmojiPicker(false);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setInputMessage(prev => prev + emojiObject.emoji);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const fileType = file.type.startsWith('video/') ? 'chat-video' : 'chat-image';
        const messageType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileType);

        try {
            const response = await fetch('http://localhost:8082/api/files/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                onSendMessage(file.name, messageType, data.url);
            }
        } catch (err) {
            console.error("Failed to upload media:", err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!activeChat) {
        return (
            <div className="flex-1 bg-[#f0f2f5] flex flex-col items-center justify-center border-b-[6px] border-[#128c7e]">
                <div className="w-80 h-80 bg-gray-200 rounded-full mb-8 overflow-hidden flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-40 h-40 text-gray-400" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S7.33 8 6.5 8 5 8.67 5 9.5 5.67 1.5 6.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-light text-gray-700 mb-4">WhatsApp Clone for Windows</h1>
                <p className="text-gray-500">Send and receive messages in real-time.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#efeae2]">
            {/* Chat Header */}
            <div className="bg-[#f0f2f5] h-16 flex items-center px-4 border-b border-gray-200">
                {activeChat.profileImageUrl ? (
                    <img src={activeChat.profileImageUrl} alt="Contact" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold uppercase">
                        {activeChat.phoneNumber ? activeChat.phoneNumber.charAt(0) : 'U'}
                    </div>
                )}
                <div className="ml-4 flex-1">
                    <h2 className="font-semibold text-gray-800">{activeChat.fullName || activeChat.phoneNumber}</h2>
                    <p className="text-xs text-gray-600">{activeChat.status === 'ONLINE' ? 'online' : 'offline'}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                {messages.map((msg, index) => {
                    const isMine = msg.senderId === currentUser.username || msg.senderId === currentUser.phoneNumber;
                    return (
                        <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative ${isMine ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
                                    }`}
                            >
                                {msg.messageType === 'IMAGE' ? (
                                    <div className="pb-3">
                                        <img src={msg.mediaUrl} alt={msg.content} className="max-w-full rounded-lg max-h-64 object-contain" />
                                        {msg.content && <p className="text-gray-800 text-[14.2px] mt-1">{msg.content}</p>}
                                    </div>
                                ) : msg.messageType === 'VIDEO' ? (
                                    <div className="pb-3">
                                        <video src={msg.mediaUrl} controls className="max-w-full rounded-lg max-h-64" />
                                    </div>
                                ) : (
                                    <p className="text-gray-800 text-[14.2px] leading-relaxed break-words pb-3">
                                        {msg.content}
                                    </p>
                                )}
                                <div className="absolute bottom-1 right-2 flex items-center">
                                    <span className="text-[11px] text-gray-500">
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Emoji Picker Popup */}
            {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 z-50 shadow-2xl">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            {/* Input Area */}
            <div className="bg-[#f0f2f5] p-3 flex items-center relative gap-2">
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-500 p-2 rounded-full hover:bg-gray-200"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current text-gray-500">
                        <path d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.12 0-4.66-1.57-5.18-2.07-.38-.37-.03-1.07.41-1.07.44 0 1.25.75 4.77.75 3.52 0 4.13-1.07 4.13-1.07.45-.53 1.34-.15 1.34-1.5-.47.88-.42 2.05-.42 2.05zm-2.46-2.47c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965z"></path>
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-gray-500 p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current text-gray-500">
                        <path d="M11.816 6.184c-1.39-1.39-3.64-1.39-5.03 0-1.39 1.39-1.39 3.64 0 5.03l6.57 6.57c.7.7 1.83.7 2.53 0 .7-.7.7-1.84 0-2.54l-5.83-5.83c-.35-.35-.92-.35-1.27 0-.35.35-.35.91 0 1.26l4.57 4.58.7-.71-4.57-4.58c.04-.04.1-.04.14 0 .39.39.39 1.02 0 1.41l5.83 5.83c1.09 1.09 2.86 1.09 3.95 0 1.09-1.09 1.09-2.86 0-3.95l-6.57-6.57c-2.16-2.16-5.67-2.16-7.84 0-2.16 2.16-2.16 5.67 0 7.84l7.14 7.15c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-7.14-7.15z"></path>
                    </svg>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    className="hidden"
                />

                <form onSubmit={handleSend} className="flex-1 flex space-x-2 items-center ml-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 rounded-lg px-4 py-2.5 focus:outline-none text-sm text-gray-700 border-none shadow-sm"
                        placeholder={isUploading ? "Uploading..." : "Type a message"}
                        disabled={isUploading}
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() && !isUploading}
                        className="text-gray-500 p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current text-gray-500">
                            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
