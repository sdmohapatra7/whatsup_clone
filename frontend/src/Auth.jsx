import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Auth({ setUser }) {
    const [step, setStep] = useState(1); // 1 = Phone Number, 2 = OTP, 3 = 2FA PIN
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [twoStepPin, setTwoStepPin] = useState('');
    const [tempUserId, setTempUserId] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            const response = await fetch('http://localhost:8082/api/users/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to request OTP');
            }

            setSuccessMsg('OTP requested successfully. Check the backend server console!');
            setStep(2);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8082/api/users/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, otpCode })
            });

            if (response.status === 202) {
                // Requires Two-Step Verification
                const data = await response.json();
                setTempUserId(data.userId);
                setStep(3);
                setSuccessMsg('OTP Verified. Please enter your Two-Step PIN.');
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Invalid OTP');
            }

            const userData = await response.json();
            setUser(userData);
            localStorage.setItem('chatUser', JSON.stringify(userData));
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleVerifyTwoStep = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8082/api/users/verify-two-step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: tempUserId, pin: twoStepPin })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Invalid PIN');
            }

            const userData = await response.json();
            setUser(userData);
            localStorage.setItem('chatUser', JSON.stringify(userData));
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#128c7e]">WhatsApp Clone</h2>
                    <p className="text-gray-600 mt-2">
                        {step === 1 && 'Enter your phone number to continue'}
                        {step === 2 && 'Enter the 6-digit OTP'}
                        {step === 3 && 'Two-Step Verification'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                        {successMsg}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                placeholder="+1234567890"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#128c7e] focus:border-[#128c7e]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#128c7e] hover:bg-[#075e54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#128c7e]"
                        >
                            Request OTP
                        </button>
                    </form>
                ) : step === 2 ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                            <input
                                type="text"
                                required
                                placeholder="123456"
                                maxLength="6"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#128c7e] focus:border-[#128c7e] text-center tracking-widest text-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#128c7e] hover:bg-[#075e54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#128c7e]"
                        >
                            Verify OTP
                        </button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setSuccessMsg('');
                                    setOtpCode('');
                                }}
                                className="text-sm text-[#128c7e] hover:underline"
                            >
                                Change Phone Number
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyTwoStep} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter your 6-digit PIN</label>
                            <input
                                type="password"
                                required
                                placeholder="******"
                                maxLength="6"
                                value={twoStepPin}
                                onChange={(e) => setTwoStepPin(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#128c7e] focus:border-[#128c7e] text-center tracking-widest text-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#128c7e] hover:bg-[#075e54] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#128c7e]"
                        >
                            Verify PIN & Login
                        </button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setSuccessMsg('');
                                    setTwoStepPin('');
                                    setOtpCode('');
                                }}
                                className="text-sm text-[#128c7e] hover:underline"
                            >
                                Start Over
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Auth;
