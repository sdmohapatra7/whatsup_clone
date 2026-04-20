import React from 'react';

/**
 * Advanced Error Boundary to catch UI runtime crashes and provide 
 * a fallback UI while logging the error for telemetry.
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Advanced Handled Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0e11] flex items-center justify-center p-8 font-['Plus_Jakarta_Sans']">
                    <div className="bg-[#111b21] p-12 rounded-[40px] border border-red-500/20 shadow-2xl text-center max-w-lg animate-entrance">
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h1 className="text-2xl font-black text-white mb-4 uppercase italic">Encryption Anomaly Detected</h1>
                        <p className="text-[#8696a0] text-sm leading-relaxed mb-10">The protocol encountered an unexpected state. All session data is secured. Please re-synchronize the interface.</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-[#25d366] text-black px-10 py-4 rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#25d36633]"
                        >
                            Hard Reset Node
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
