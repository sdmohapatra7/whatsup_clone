import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import { useDebounce } from '../../hooks/useDebounce';

export default function Sidebar({ onLogout }) {
    const { currentUser, users, groups, setGroups, unreadCounts, activeChat, setActiveChat, recentMessages, showToast } = useChatStore();
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // ADVANCED: Implementing Debounced Search for Performance
    const debouncedSearch = useDebounce(searchQuery, 300);
    
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

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedMembers.length === 0) return;
        try {
            const res = await fetch('http://localhost:8082/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('chatToken')}` },
                body: JSON.stringify({ name: newGroupName, memberIds: [...selectedMembers, currentUser.id], adminId: currentUser.id })
            });
            if (res.ok) {
                const ng = await res.json();
                setGroups([...groups, ng]);
                setIsCreatingGroup(false);
                setActiveChat(ng);
                showToast(`Group "${newGroupName}" established.`);
            }
        } catch (e) { showToast("Critical error", "error"); }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#111b21] border-r border-white/5 relative z-20">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-4 md:px-8 bg-[#202c33]/50 backdrop-blur-md shrink-0">
                <div onClick={() => navigate('/profile')} className="flex items-center space-x-4 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center text-black font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                        {(currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase()}
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
                    <button onClick={() => setIsCreatingGroup(true)} className="p-3 hover:bg-white/5 rounded-2xl transition-all"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
                    <button onClick={onLogout} className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
                </div>
            </div>

            {/* ADVANCED: Debounced Search Input */}
            <div className="p-5 bg-[#111b21]">
                <div className="bg-[#202c33] flex items-center px-6 py-4 rounded-3xl border border-white/5 focus-within:border-[#25d366]/30 transition-all shadow-inner">
                    <svg className="w-4 h-4 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Explore Secure Threads" 
                        className="bg-transparent border-none outline-none text-[13px] ml-4 w-full text-gray-200 font-bold placeholder:text-gray-600" 
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 hide-scrollbar">
                {filteredContent.map((item) => {
                    const id = item.isGroup ? item.id : item.username;
                    const isActive = (item.isGroup && activeChat?.id === item.id) || (!item.isGroup && activeChat?.username === item.username);
                    const lastMsg = recentMessages.find(m => item.isGroup ? m.groupId === item.id : (m.senderId === item.username || m.recipientId === item.username));

                    return (
                        <div key={id} onClick={() => setActiveChat(item)} className={`px-5 py-5 flex items-center cursor-pointer rounded-[24px] border-l-4 transition-all ${isActive ? 'bg-[#2a3942] border-[#25d366] shadow-xl' : 'hover:bg-[#202c33]/50 border-transparent shadow-none'}`}>
                            {/* Avatar and Info... */}
                            <div className="relative shrink-0">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10 ${item.isGroup ? 'bg-gradient-to-br from-[#25d366] to-[#128c7e] text-black' : 'bg-[#374045]'}`}>
                                    {item.profileImageUrl || item.groupImageUrl ? <img src={item.profileImageUrl || item.groupImageUrl} alt="" className="w-full h-full object-cover rounded-2xl" /> : (item.name || item.fullName || item.phoneNumber || '?').charAt(0).toUpperCase()}
                                </div>
                                {!item.isGroup && item.status === 'ONLINE' && <span className="absolute bottom-[-2px] right-[-2px] w-4 h-4 bg-[#25d366] border-[3px] border-[#111b21] rounded-full shadow-[0_0_8px_#25d366]"></span>}
                            </div>
                            <div className="ml-5 flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-black text-gray-100 text-[13px] tracking-tight truncate">{item.name || item.fullName || item.phoneNumber}</h3>
                                    <span className="text-[9px] font-black text-[#8696a0] uppercase">{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-[11px] truncate font-bold ${unreadCounts[id] > 0 ? 'text-[#25d366]' : 'text-[#8696a0]/60'}`}>{lastMsg ? lastMsg.content : 'Initiate Session'}</p>
                                    {unreadCounts[id] > 0 && <span className="min-w-[18px] px-1 h-[18px] bg-[#25d366] text-black rounded-full flex items-center justify-center text-[9px] font-black shadow-[0_0_10px_#25d36666] ml-2">{unreadCounts[id]}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* New Group Overlay (Responsive Modal) */}
            {isCreatingGroup && (
                <div className="fixed inset-0 md:absolute md:inset-0 z-50 flex items-center justify-center bg-black/60 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-6 md:p-0">
                    <div className="w-full max-w-sm md:absolute md:inset-x-8 md:bottom-32 p-8 bg-[#202c33] rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/5 animate-entrance">
                        <p className="text-[10px] font-black text-[#25d366] mb-6 uppercase tracking-[4px]">CONSTRUCT GROUP</p>
                        <input autoFocus placeholder="Circle Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="w-full bg-[#111b21] border-2 border-white/5 rounded-3xl px-6 py-4 text-sm text-white outline-none mb-6 focus:border-[#25d366]/30" />
                        <button onClick={handleCreateGroup} className="w-full bg-[#25d366] text-black font-black py-4 rounded-3xl text-sm transition-all active:scale-95 shadow-xl shadow-[#25d36633]">Establish Thread</button>
                        <button onClick={() => setIsCreatingGroup(false)} className="w-full mt-4 text-[#8696a0] text-[10px] font-black uppercase tracking-widest py-2 hover:text-white">Discard</button>
                    </div>
                </div>
            )}
        </div>
    );
}
