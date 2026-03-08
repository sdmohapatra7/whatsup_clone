export default function Sidebar({ currentUser, users, activeChat, setActiveChat, recentMessages, onLogout, onOpenProfile }) {
    // Filter out current user
    const otherUsers = users.filter(u => u.username !== currentUser.username);

    // Create a rich list of contacts to show
    // We want to sort them by recent message timestamp
    const contactList = otherUsers.map(user => {
        const recentMsg = recentMessages.find(m =>
            m.senderId === user.username || m.recipientId === user.username
        );
        return {
            ...user,
            lastMessage: recentMsg ? recentMsg.content : null,
            lastMessageTime: recentMsg ? recentMsg.timestamp : null,
        };
    }).sort((a, b) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    return (
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="bg-[#f0f2f5] h-16 flex items-center justify-between px-4 py-2 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    {currentUser.profileImageUrl ? (
                        <img src={currentUser.profileImageUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold uppercase">
                            {currentUser.phoneNumber ? currentUser.phoneNumber.charAt(0) : '?'}
                        </div>
                    )}
                    <span className="font-semibold">{currentUser.fullName || currentUser.phoneNumber}</span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onOpenProfile}
                        className="text-gray-600 hover:text-gray-800 p-2"
                        title="Profile Settings"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>
                    <button
                        onClick={onLogout}
                        className="text-gray-600 hover:text-gray-800 p-2"
                        title="Logout"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
                {contactList.map((user) => (
                    <div
                        key={user.id || user.username}
                        onClick={() => setActiveChat(user)}
                        className={`flex items-center p-3 cursor-pointer border-b border-gray-100 hover:bg-[#f5f6f6] ${activeChat?.username === user.username ? 'bg-[#ebebeb]' : ''
                            }`}
                    >
                        {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="Contact" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-700 font-bold text-xl uppercase">
                                {user.phoneNumber ? user.phoneNumber.charAt(0) : 'U'}
                            </div>
                        )}
                        <div className="ml-4 flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-medium text-gray-900 truncate">{user.fullName || user.phoneNumber}</h3>
                                {user.lastMessageTime && (
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                        {new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-gray-500 truncate">{user.lastMessage || 'Start a conversation'}</p>
                                {user.status === 'ONLINE' && (
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {contactList.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No other users found. Open another browser to register a new user.
                    </div>
                )}
            </div>
        </div>
    );
}
