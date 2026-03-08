import { useState } from 'react';

export default function ProfileSettings({ currentUser, setUser, onClose }) {
    const [fullName, setFullName] = useState(currentUser.fullName || '');
    const [email, setEmail] = useState(currentUser.email || '');
    const [profileImageUrl, setProfileImageUrl] = useState(currentUser.profileImageUrl || '');
    const [isTwoStepEnabled, setIsTwoStepEnabled] = useState(currentUser.twoStepEnabled || false);
    const [twoStepPin, setTwoStepPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'profile');

        try {
            const response = await fetch('http://localhost:8082/api/files/upload', {
                method: 'POST',
                body: formData,
                // Note: Do NOT set Content-Type for FormData, the browser sets it automatically with the correct boundary
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to upload image');
            }

            const data = await response.json();
            setProfileImageUrl(data.url);
            setSuccess('Image uploaded successfully! Don\'t forget to click Save Changes.');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleTwoStep = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isTwoStepEnabled) {
                // Disable 2FA
                const response = await fetch(`http://localhost:8082/api/users/${currentUser.id}/two-step`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to disable Two-Step Verification');

                const updatedUser = await response.json();
                setUser(updatedUser);
                localStorage.setItem('chatUser', JSON.stringify(updatedUser));
                setIsTwoStepEnabled(false);
                setShowPinInput(false);
                setTwoStepPin('');
                setSuccess('Two-Step Verification disabled.');
            } else {
                // Enable 2FA
                if (twoStepPin.length !== 6) {
                    throw new Error('PIN must be exactly 6 digits.');
                }
                const response = await fetch(`http://localhost:8082/api/users/${currentUser.id}/two-step`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: twoStepPin })
                });
                if (!response.ok) throw new Error('Failed to enable Two-Step Verification');

                const updatedUser = await response.json();
                setUser(updatedUser);
                localStorage.setItem('chatUser', JSON.stringify(updatedUser));
                setIsTwoStepEnabled(true);
                setShowPinInput(false);
                setSuccess('Two-Step Verification enabled.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://localhost:8082/api/users/${currentUser.id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, profileImageUrl })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            localStorage.setItem('chatUser', JSON.stringify(updatedUser));
            setSuccess('Profile updated successfully!');
            setTimeout(onClose, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-[#008069] px-6 py-4 flex items-center justify-between text-white">
                    <h2 className="text-xl font-semibold">Profile Settings</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Display current image */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {profileImageUrl ? (
                                <img src={profileImageUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold border-4 border-white shadow-md">
                                    {currentUser.phoneNumber ? currentUser.phoneNumber.charAt(0) : '?'}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-sm border border-green-200">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#008069] focus:border-[#008069]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email (optional)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#008069] focus:border-[#008069]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#008069] focus:border-[#008069] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e0f1ee] file:text-[#008069] hover:file:bg-[#d1e8e4]"
                            />
                            {profileImageUrl && <p className="text-xs text-gray-500 mt-1 truncate">Current: {profileImageUrl}</p>}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Two-Step Verification</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-700">
                                        Status: <span className={`font-semibold ${isTwoStepEnabled ? 'text-green-600' : 'text-red-500'}`}>
                                            {isTwoStepEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isTwoStepEnabled) {
                                                handleToggleTwoStep();
                                            } else {
                                                setShowPinInput(!showPinInput);
                                                setTwoStepPin('');
                                            }
                                        }}
                                        disabled={isLoading}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${isTwoStepEnabled
                                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                            : 'text-[#008069] bg-[#e0f1ee] hover:bg-[#d1e8e4]'
                                            }`}
                                    >
                                        {isTwoStepEnabled ? 'Disable' : (showPinInput ? 'Cancel' : 'Enable')}
                                    </button>
                                </div>

                                {showPinInput && !isTwoStepEnabled && (
                                    <div className="flex items-end space-x-2">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Create 6-digit PIN</label>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                value={twoStepPin}
                                                onChange={(e) => setTwoStepPin(e.target.value)}
                                                placeholder="******"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#008069] focus:border-[#008069] text-center tracking-widest"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleToggleTwoStep}
                                            disabled={isLoading || twoStepPin.length !== 6}
                                            className="px-4 py-2 text-sm font-medium text-white bg-[#008069] rounded-md hover:bg-[#01705c] disabled:opacity-50"
                                        >
                                            Save PIN
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#008069] border border-transparent rounded-md hover:bg-[#01705c] disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
