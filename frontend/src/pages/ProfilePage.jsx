import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/useChatStore';
import { api } from '../services/api';

const ProfilePage = () => {
    const { currentUser, setCurrentUser, showToast } = useChatStore();
    const [fullName, setFullName] = useState(currentUser?.fullName || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Using the updated api helper with PUT support
            const updated = await api.post(`/users/${currentUser.id}/profile`, { fullName, email }, 'PUT');
            if (updated && typeof updated === 'object') {
                setCurrentUser(updated);
                showToast("Identity Synchronized");
                navigate('/');
            }
        } catch (err) { 
            showToast("Sync Failed: " + err.message, "error"); 
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e11] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#25d366]/5 rounded-full blur-[150px]"></div>
            
            <div className="w-full max-w-[550px] relative z-10 animate-entrance">
                <div className="bg-[#111b21] rounded-[48px] p-12 border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-black text-gray-100 italic">User Profile</h1>
                            <p className="text-[10px] font-black text-[#25d366] uppercase tracking-[4px] mt-1">Identity Management</p>
                        </div>
                        <button onClick={() => navigate('/')} className="p-4 bg-white/5 rounded-2xl text-[#8696a0] hover:text-white transition-all hover:scale-110">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col items-center mb-12">
                         <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center text-4xl font-black text-[#111b21] shadow-2xl shadow-[#25d36622] mb-6">
                            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                         </div>
                         <p className="text-[9px] font-black text-white/20 uppercase tracking-[2px]">Primary Mesh Node</p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-4">Display Identity</label>
                                <input
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-[#0a0e11] border-2 border-white/5 rounded-3xl px-8 py-5 text-white focus:border-[#25d366]/30 outline-none text-lg font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-4">Secure Contact Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0a0e11] border-2 border-white/5 rounded-3xl px-8 py-5 text-white focus:border-[#25d366]/30 outline-none text-lg font-bold placeholder:text-white/5"
                                    placeholder="contact@secure.mesh"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-[#25d366] text-[#111b21] py-6 rounded-3xl font-black text-lg uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-[#25d36633] disabled:opacity-50"
                        >
                            {isLoading ? 'Processing Access...' : 'Commit Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
