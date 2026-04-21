import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/useChatStore';
import { api } from '../services/api';

const AuthPage = () => {
    // 1: Creds (Login/Reg), 2: Phone, 3: OTP
    const [step, setStep] = useState(1); 
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Form States
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [tempUserId, setTempUserId] = useState(null);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const setCurrentUser = useChatStore(state => state.setCurrentUser);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (step === 1) {
                // Unified Login/Registration: If account doesn't exist, it's created on the fly
                const data = await api.post('/users/login', { fullName, email, password });
                setTempUserId(data.userId);
                setStep(2);
            } else if (step === 2) {
                // STEP 2: Phone Request
                await api.post('/users/request-otp', { phoneNumber, userId: tempUserId });
                setStep(3);
            } else if (step === 3) {
                // STEP 3: OTP Verification
                const data = await api.post('/users/verify-otp', { phoneNumber, otpCode, userId: tempUserId });
                localStorage.setItem('chatToken', data.token);
                setCurrentUser(data.user);
                navigate('/');
            }
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="h-screen w-full bg-[#0a0e11] flex overflow-hidden font-['Plus_Jakarta_Sans'] selection:bg-[#25d366]/30">
            {/* LEFT SIDE: Professional Tech Person */}
            <div className="hidden lg:flex w-1/2 relative bg-[#0a0e11] items-center justify-center overflow-hidden border-r border-white/5">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#25d366]/10 rounded-full blur-[120px] animate-pulse"></div>
                
                {/* Person Background */}
                <div className="absolute inset-0 opacity-40">
                    <img 
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop" 
                        alt="Tech Environment" 
                        className="w-full h-full object-cover grayscale brightness-50"
                    />
                </div>

                <div className="relative z-10 w-full h-full p-20 flex flex-col items-center justify-center text-center">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#25d366]/20 rounded-full blur-[100px] group-hover:bg-[#25d366]/40 transition-all duration-1000"></div>
                        <div className="relative z-20 w-[450px] h-[450px] rounded-[60px] overflow-hidden border border-[#25d366]/30 shadow-[0_0_80px_#25d36611] animate-float">
                            <img 
                                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop" 
                                alt="Tech Professional" 
                                className="w-full h-full object-cover"
                            />
                            {/* Pointing Overlay Effect */}
                            <div className="absolute bottom-10 right-10 bg-[#25d366] p-4 rounded-full shadow-[0_0_30px_#25d366] animate-bounce">
                                <svg className="w-8 h-8 text-black transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 space-y-4 max-w-md">
                        <h2 className="text-4xl font-black text-gray-100 italic uppercase tracking-tighter">Unified Secure <span className="text-[#25d366]">Protocol</span></h2>
                        <p className="text-[#8696a0] text-xs font-bold leading-relaxed tracking-[4px] uppercase">End-to-End Encryption • Multi-Factor Auth • Decentralized Mesh</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Access Form */}
            <div className="flex-1 relative overflow-y-auto overflow-x-hidden p-8">
                <div className="min-h-full flex flex-col items-center justify-center py-12">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#25d366]/5 rounded-full blur-[120px]"></div>
                    
                    <div className="w-full max-w-[480px] relative z-10 animate-entrance">
                    <div className="bg-[#111b21] rounded-[32px] md:rounded-[48px] p-8 md:p-12 border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
                        <div className="lg:hidden w-20 h-20 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-[32px] mx-auto flex items-center justify-center shadow-2xl mb-10 rotate-6">
                             <svg className="w-12 h-12 text-[#111b21]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        </div>
                        
                        <h1 className="text-3xl font-black text-gray-100 text-center uppercase tracking-tighter mb-1 select-none italic">WhatsApp <span className="text-[#25d366]">Pro</span></h1>
                        <p className="text-[#8696a0] text-center text-[9px] uppercase font-black tracking-[6px] mb-12">Multi-Factor Gateway</p>

                        {error && <div className="bg-white/5 text-[#25d366] p-5 rounded-3xl text-[10px] font-black mb-8 text-center border border-[#25d366]/20 uppercase tracking-[2px] animate-pulse">{error}</div>}

                        <form onSubmit={handleAuth} className="space-y-8">
                            {step === 1 && (
                                <div className="space-y-6">
                                    {isRegistering && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-4">Full Name</label>
                                            <input required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-[#0a0e11] border-2 border-white/5 rounded-3xl px-6 py-5 text-white focus:border-[#25d366]/30 outline-none font-bold" placeholder="Identity Name" />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-4">Mesh Email</label>
                                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0a0e11] border-2 border-white/5 rounded-3xl px-6 py-5 text-white focus:border-[#25d366]/30 outline-none font-bold placeholder:text-white/5" placeholder="node@protocol.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-4">Secure Password</label>
                                        <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0a0e11] border-2 border-white/5 rounded-3xl px-6 py-5 text-white focus:border-[#25d366]/30 outline-none font-bold" placeholder="••••••••" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[4px] ml-6 text-center block">Stage 2: Phone Link</label>
                                    <input required type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-[#0a0e11] border-2 border-white/5 rounded-[28px] px-8 py-6 text-white focus:border-[#25d366]/40 transition-all outline-none text-center text-3xl font-black placeholder:text-white/5 shadow-inner" placeholder="+1 123 456" />
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[4px] ml-6 text-center block">Stage 3: Verification</label>
                                    <input required type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full bg-[#0a0e11] border-2 border-white/5 rounded-[28px] px-8 py-6 text-white focus:border-[#25d366]/40 transition-all outline-none text-center text-3xl font-black placeholder:text-white/5 shadow-inner tracking-[10px]" placeholder="000000" />
                                </div>
                            )}

                            <button
                                disabled={isLoading}
                                className="w-full bg-[#25d366] text-[#111b21] py-6 rounded-3xl font-black text-lg uppercase tracking-[4px] hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-[#25d36633] disabled:opacity-50"
                            >
                                {isLoading ? 'Processing Signal...' : (
                                    step === 1 ? 'Establish Connection' :
                                    step === 2 ? 'Send Secure Link' : 'Finalize Encryption'
                                )}
                            </button>
                        </form>
 
                        {step === 1 && (
                            <div className="mt-8 text-center">
                                <button onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors">
                                    {isRegistering ? 'Just login with email' : 'New here? Set a custom name'}
                                </button>
                            </div>
                        )}

                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="w-full mt-6 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">Return to previous stage</button>
                        )}
                    </div>
                    
                    <div className="mt-12 text-center opacity-10">
                        <p className="text-[9px] font-black text-white uppercase tracking-[4px]">Advanced Multi-Factor Protocol Enabled</p>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default AuthPage;
