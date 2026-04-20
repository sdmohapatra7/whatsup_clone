import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useChatStore from './store/useChatStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';

/**
 * CODE SPLITTING: Implementing Dynamic Imports for Page Components.
 * This optimizes the initial bundle size by loading pages only when needed.
 */
const AuthPage = lazy(() => import('./pages/AuthPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

/**
 * LOADING FALLBACK: High-End Loading UI for Suspense.
 */
const LoadingTerminal = () => (
    <div className="min-h-screen bg-[#0a0e11] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 border-4 border-[#25d366]/20 border-t-[#25d366] rounded-full animate-spin"></div>
            <p className="text-[#25d366] text-[10px] font-black uppercase tracking-[8px] animate-pulse">Initializing Mesh</p>
        </div>
    </div>
);

/**
 * HIGHER ORDER COMPONENT (HOC): Implementing Protected Route logic centrally.
 */
const ProtectedRoute = ({ children }) => {
    const currentUser = useChatStore(state => state.currentUser);
    return currentUser ? children : <Navigate to="/auth" />;
};

const PublicRoute = ({ children }) => {
    const currentUser = useChatStore(state => state.currentUser);
    return !currentUser ? children : <Navigate to="/" />;
};

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Suspense fallback={<LoadingTerminal />}>
                    <Routes>
                        {/* Advanced Route Architecture */}
                        <Route 
                            path="/auth" 
                            element={<PublicRoute><AuthPage /></PublicRoute>} 
                        />
                        <Route 
                            path="/" 
                            element={<ProtectedRoute><HomePage /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/profile" 
                            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
                        />
                        
                        {/* Intelligent Default Redirection */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
