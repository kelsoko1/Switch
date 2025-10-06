import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Eager load layouts (small and needed immediately)
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Lazy load all page components for code splitting
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ChatList = lazy(() => import('./pages/chat/ChatList'));
const ChatRoom = lazy(() => import('./pages/chat/ChatRoom'));
const DirectChatRoom = lazy(() => import('./pages/chat/DirectChatRoom'));
const LiveStreams = lazy(() => import('./pages/streams/LiveStreams'));
const CreateStreamNew = lazy(() => import('./pages/streams/CreateStreamNew'));
const StreamView = lazy(() => import('./pages/streams/StreamView'));
const UploadVideo = lazy(() => import('./pages/streams/UploadVideo'));
const CreateShort = lazy(() => import('./pages/streams/CreateShort'));
const WalletTanzania = lazy(() => import('./pages/wallet/WalletTanzania'));
const KijumbeDashboard = lazy(() => import('./pages/kijumbe/KijumbeDashboard'));
const CreateGroup = lazy(() => import('./pages/kijumbe/CreateGroup'));
const GroupDetails = lazy(() => import('./pages/kijumbe/GroupDetails'));
const Settings = lazy(() => import('./pages/settings/Settings'));

import { XMPPProvider } from './contexts/XMPPContext';
import { AppwriteProvider } from './contexts/AppwriteContext';
import { AuthProvider as KijumbeAuthProvider } from './contexts/KijumbeAuthContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  
  return (
    <AuthProvider>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <AppContentWithAuth />
      )}
    </AuthProvider>
  );
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function AppContentWithAuth() {
  // Get authentication state from AuthContext
  const { isAuthenticated } = useAuth();

  return (
    <XMPPProvider>
      <KijumbeAuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/auth/login" />}>
                <Route index element={<Navigate to="chats" replace />} />
                <Route path="chats" element={<ChatList />} />
                <Route path="chat/group/:chatId" element={<ChatRoom />} />
                <Route path="chat/:id" element={<DirectChatRoom />} />
                <Route path="streams" element={<LiveStreams />} />
                <Route path="streams/create" element={<CreateStreamNew />} />
                <Route path="streams/upload" element={<UploadVideo />} />
                <Route path="streams/shorts/create" element={<CreateShort />} />
                <Route path="streams/:streamId" element={<StreamView />} />
                <Route path="wallet" element={<WalletTanzania />} />
                <Route path="kijumbe" element={<KijumbeDashboard />} />
                <Route path="kijumbe/create-group" element={<CreateGroup />} />
                <Route path="kijumbe/group/:groupId" element={<GroupDetails />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </KijumbeAuthProvider>
    </XMPPProvider>
  );
}

// Wrap the main App component with AppwriteProvider and ErrorBoundary
function App() {
  return (
    <ErrorBoundary>
      <AppwriteProvider>
        <AppContent />
      </AppwriteProvider>
    </ErrorBoundary>
  );
}

export default App;