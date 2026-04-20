import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/useChatStore';
import { api } from '../services/api';

const AuthPage = () => {
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const setCurrentUser = useChatStore(state => state.setCurrentUser);

    const handleAction = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const endpoint = step === 1 ? '/users/request-otp' : '/users/verify-otp';
        const body = step === 1 ? { phoneNumber } : { phoneNumber, otpCode };

        try {
            const data = await api.post(endpoint, body);
            
            // If data is just a string, it means OTP was requested (Step 1)
            if (typeof data === 'string' || (data && data.message)) {
                if (step === 1) {
                    setStep(2);
                }
            } else if (data && data.user && data.token) {
                // If it's an object with token/user, it's a successful login (Step 2)
                localStorage.setItem('chatToken', data.token);
                setCurrentUser(data.user);
                navigate('/');
            } else if (data && data.requiresTwoStep) {
                // Feature handled elsewhere or to be implemented
                setError("Two-step verification required (Not implemented in this view)");
            }
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e11] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-[#25d366]/30 font-['Plus_Jakarta_Sans']">
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#25d366]/5 rounded-full blur-[120px]"></div>
            
            <div className="w-full max-w-[420px] relative z-10 animate-entrance">
                <div className="bg-[#111b21] rounded-[48px] p-12 border border-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-[38px] mx-auto flex items-center justify-center shadow-2xl mb-12 rotate-6 hover:rotate-0 transition-transform duration-500">
                         <svg className="w-14 h-14 text-[#111b21]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    </div>
                    
                    <h1 className="text-4xl font-black text-gray-100 text-center uppercase italic tracking-tighter mb-2">WhatsApp <span className="text-[#25d366]">Pro</span></h1>
                    <p className="text-[#8696a0] text-center text-[10px] uppercase font-black tracking-[5px] mb-12">Authorized Access Point</p>

                    {error && <div className="bg-red-500/10 text-red-500 p-5 rounded-3xl text-[11px] font-black mb-8 text-center border border-red-500/20 uppercase tracking-widest">{error}</div>}

                    <form onSubmit={handleAction} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[4px] ml-6">{step === 1 ? 'Primary Contact' : 'Digital Passkey'}</label>
                            <input
                                required
                                type={step === 1 ? "tel" : "text"}
                                value={step === 1 ? phoneNumber : otpCode}
                                onChange={(e) => step === 1 ? setPhoneNumber(e.target.value) : setOtpCode(e.target.value)}
                                className="w-full bg-[#0a0e11] border-2 border-white/5 rounded-[28px] px-8 py-6 text-white focus:border-[#25d366]/40 transition-all outline-none text-center text-3xl font-black placeholder:text-white/5 shadow-inner"
                                placeholder={step === 1 ? "+1 000 000" : "000000"}
                                autoComplete="off"
                            />
                        </div>
                        <button
                            disabled={isLoading}
                            className="w-full bg-[#25d366] text-[#111b21] py-6 rounded-[28px] font-black text-lg uppercase tracking-[4px] hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-[#25d36633] disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-[3px] border-black/20 border-t-black rounded-full animate-spin mx-auto"></div>
                            ) : (
                                step === 1 ? 'Generate Link' : 'Confirm Entry'
                            )}
                        </button>
                    </form>
                    
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="w-full mt-6 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors">Return to Contact Entry</button>
                    )}
                </div>
                
                <div className="mt-12 text-center opacity-20 group">
                    <p className="text-[9px] font-black text-white uppercase tracking-[3px] group-hover:text-[#25d366] transition-colors">Mesh Encryption Secured v4.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
