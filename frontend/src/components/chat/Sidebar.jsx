import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../services/api';

export default function Sidebar({ onLogout }) {
    const { currentUser, users, groups, setGroups, unreadCounts, activeChat, setActiveChat, recentMessages, showToast } = useChatStore();
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    
    // ADVANCED: Implementing Debounced Search for Performance
    const debouncedSearch = useDebounce(searchQuery, 300);
    const debouncedMemberSearch = useDebounce(memberSearchQuery, 300);
    
    const navigate = useNavigate();
    const otherUsers = users.filter(u => u.username !== currentUser.username);

    // Filtered list based on debounced query
    const filteredContent = useMemo(() => {
        const fullList = [...groups.map(g => ({...g, isGroup: true})), ...otherUsers];
        if (!debouncedSearch) return fullList;
        
        const q = debouncedSearch.toLowerCase();
        return fullList.filter(item => 
            (item.name || item.fullName || item.phoneNumber || '').toLowerCase().includes(q)
        );
    }, [groups, otherUsers, debouncedSearch]);

    // Member filtering for Group Creation (Debounced)
    const filteredMembers = useMemo(() => {
        if (!debouncedMemberSearch) return otherUsers;
        const q = debouncedMemberSearch.toLowerCase();
        return otherUsers.filter(u => 
            (u.fullName || u.username || u.phoneNumber || '').toLowerCase().includes(q)
        );
    }, [otherUsers, debouncedMemberSearch]);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedMembers.length === 0) return;
        try {
            const ng = await api.post('/groups', { 
                name: newGroupName, 
                memberIds: [...selectedMembers, currentUser.id], 
                adminId: currentUser.id 
            });
            setGroups([...groups, ng]);
            setIsCreatingGroup(false);
            setActiveChat(ng);
            showToast(`Group "${newGroupName}" established.`);
        } catch (e) { showToast("Critical error", "error"); }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#111b21] border-r border-white/5 relative z-20 overflow-hidden">
            {!isCreatingGroup ? (
                <>
                    {/* Header */}
                    <div className="h-20 flex items-center justify-between px-4 md:px-8 bg-[#202c33]/50 backdrop-blur-md shrink-0">
                        {/* ... existing header ... */}
                        <div onClick={() => navigate('/profile')} className="flex items-center space-x-4 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center text-black font-black text-xl shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                                {currentUser.profileImageUrl ? (
                                    <img src={currentUser.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-gray-100 text-sm tracking-tight group-hover:text-[#25d366] transition-colors">{currentUser.fullName || 'Standard User'}</span>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-[#25d366] rounded-full mr-2 shadow-[0_0_8px_#25d366]"></span>
                                    <span className="text-[9px] text-[#25d366] font-black uppercase tracking-widest">Global Node</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 text-[#8696a0]">
                            <div className="relative">
                                <button onClick={() => setShowMenu(!showMenu)} className={`p-3 rounded-2xl transition-all ${showMenu ? 'bg-white/10 text-[#25d366]' : 'hover:bg-white/5'}`}>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                </button>
                                
                                {showMenu && (
                                    <div className="absolute right-0 mt-3 w-56 bg-[#233138] rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden z-50 animate-entrance">
                                        <div 
                                            onClick={() => {
                                                setIsCreatingGroup(true);
                                                setShowMenu(false);
                                            }}
                                            className="px-6 py-4 flex items-center space-x-4 hover:bg-white/5 cursor-pointer group transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-[#25d366]/10 flex items-center justify-center text-[#25d366] group-hover:bg-[#25d366] group-hover:text-black transition-all">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            </div>
                                            <span className="text-[13px] font-bold text-gray-200 group-hover:text-[#25d366]">New Group Thread</span>
                                        </div>
                                        <div className="h-px bg-white/5 mx-4"></div>
                                        <div className="px-6 py-4 flex items-center space-x-4 hover:bg-white/5 cursor-pointer group transition-all opacity-40 grayscale pointer-events-none">
                                            <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-500">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <span className="text-[13px] font-bold text-gray-500">Node Settings</span>
                                        </div>
                                    </div>
                                )}
                                {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>}
                            </div>
                            <button onClick={onLogout} className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-4 bg-[#111b21] shrink-0">
                        <div className="bg-[#202c33] flex items-center px-5 py-3 rounded-2xl border border-white/5 focus-within:border-[#25d366]/30 transition-all">
                            <svg className="w-4 h-4 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Explore Secure Threads" 
                                className="bg-transparent border-none outline-none text-[13px] ml-4 w-full text-gray-200 font-bold" 
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                        {filteredContent.map((item) => {
                            const id = item.isGroup ? item.id : item.username;
                            const isActive = (item.isGroup && activeChat?.id === item.id) || (!item.isGroup && activeChat?.username === item.username);
                            const lastMsg = recentMessages.find(m => item.isGroup ? m.groupId === item.id : (m.senderId === item.username || m.recipientId === item.username));

                            return (
                                <div key={id} onClick={() => setActiveChat(item)} className={`px-4 py-4 flex items-center cursor-pointer rounded-2xl transition-all ${isActive ? 'bg-[#2a3942] border-l-4 border-[#25d366] shadow-lg' : 'hover:bg-[#202c33]/50 border-l-4 border-transparent'}`}>
                                    <div className="relative shrink-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg overflow-hidden ${item.isGroup ? 'bg-gradient-to-br from-[#25d366] to-[#128c7e] text-black' : 'bg-[#374045]'}`}>
                                            {item.groupImageUrl || item.profileImageUrl ? (
                                                <img src={item.groupImageUrl || item.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (item.name || item.fullName || item.phoneNumber || '?').charAt(0).toUpperCase()}
                                        </div>
                                        {!item.isGroup && item.status === 'ONLINE' && <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 bg-[#25d366] border-2 border-[#111b21] rounded-full"></span>}
                                    </div>
                                    <div className="ml-4 flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className="font-bold text-gray-100 text-[13px] truncate">{item.name || item.fullName || item.phoneNumber}</h3>
                                            <span className="text-[10px] text-[#8696a0]">{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                        </div>
                                        <p className="text-[11px] truncate text-[#8696a0] font-medium">{lastMsg ? lastMsg.content : 'No signals yet'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden bg-[#111b21]">
                    <div className="h-24 bg-[#202c33] flex items-center px-6 space-x-4 shrink-0">
                        <button onClick={() => setIsCreatingGroup(false)} className="p-2 text-[#25d366] hover:bg-white/5 rounded-xl transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h2 className="text-xl font-bold text-gray-100 uppercase tracking-widest">New Circle</h2>
                    </div>

                    <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
                        <div className="shrink-0">
                            <label className="text-[10px] font-black text-[#25d366] uppercase tracking-[2px] mb-2 block ml-2">Circle Identity</label>
                            <input 
                                autoFocus 
                                placeholder="Group Name" 
                                value={newGroupName} 
                                onChange={e => setNewGroupName(e.target.value)} 
                                className="w-full bg-[#1c272d] border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#25d366]" 
                            />
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            <div className="flex justify-between items-center mb-2 shrink-0 px-2">
                                <label className="text-[10px] font-black text-[#8696a0] uppercase">Select Nodes</label>
                                <span className="text-[10px] font-black text-[#25d366]">{selectedMembers.length} ACTIVE</span>
                            </div>
                            
                            <div className="mb-4 bg-[#1c272d] flex items-center px-4 py-2 rounded-xl border border-white/5 shrink-0">
                                <svg className="w-3.5 h-3.5 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input 
                                    type="text" 
                                    value={memberSearchQuery}
                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                    placeholder="Find user..." 
                                    className="bg-transparent border-none outline-none text-[12px] ml-3 w-full text-gray-200" 
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                                {filteredMembers.map(user => {
                                    const isSelected = selectedMembers.includes(user.id);
                                    return (
                                        <div 
                                            key={user.id} 
                                            onClick={() => setSelectedMembers(prev => isSelected ? prev.filter(id => id !== user.id) : [...prev, user.id])}
                                            className={`flex items-center p-3 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-[#25d366]/10 border-[#25d366]' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#374045] flex items-center justify-center text-white font-bold mr-4 overflow-hidden shrink-0">
                                                {user.profileImageUrl ? <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" /> : (user.fullName || user.username).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="flex-1 text-sm font-bold text-gray-200 truncate">{user.fullName || user.username}</span>
                                            {isSelected && <div className="w-5 h-5 bg-[#25d366] rounded-full flex items-center justify-center shadow-lg"><svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 shrink-0 border-t border-white/5 bg-[#111b21] z-30">
                        <button 
                            disabled={!newGroupName.trim() || selectedMembers.length === 0}
                            onClick={handleCreateGroup} 
                            className="w-full py-4 bg-[#25d366] text-black font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all disabled:opacity-20 translate-y-0"
                        >
                            Establish Circle
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
