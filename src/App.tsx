import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChatList from './pages/chat/ChatList';
import ChatRoom from './pages/chat/ChatRoom';
import DirectChatRoom from './pages/chat/DirectChatRoom';
import LiveStreams from './pages/streams/LiveStreams';
import CreateStreamNew from './pages/streams/CreateStreamNew';
import StreamView from './pages/streams/StreamView';
import UploadVideo from './pages/streams/UploadVideo';
import CreateShort from './pages/streams/CreateShort';
import WalletTanzania from './pages/wallet/WalletTanzania';
import KijumbeDashboard from './pages/kijumbe/KijumbeDashboard';
import CreateGroup from './pages/kijumbe/CreateGroup';
import GroupDetails from './pages/kijumbe/GroupDetails';
import Settings from './pages/settings/Settings';
import SplashScreen from './components/SplashScreen';

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

function AppContentWithAuth() {
  // Get authentication state from AuthContext
  const { isAuthenticated } = useAuth();

  return (
    <XMPPProvider>
      <KijumbeAuthProvider>
        <Router>
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
        </Router>
      </KijumbeAuthProvider>
    </XMPPProvider>
  );
}

// Wrap the main App component with AppwriteProvider
function App() {
  return (
    <AppwriteProvider>
      <AppContent />
    </AppwriteProvider>
  );
}

export default App;