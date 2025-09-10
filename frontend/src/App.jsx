import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { WalletProvider } from './contexts/WalletContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Groups from './pages/Groups'
import GroupDetails from './pages/GroupDetails'
import Profile from './pages/Profile'
import Wallet from './pages/Wallet'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminGroups from './pages/admin/AdminGroups'
import AdminWhatsApp from './pages/admin/AdminWhatsApp'
import KijumbeDashboard from './pages/kijumbe/KijumbeDashboard'
import KijumbeGroups from './pages/kijumbe/KijumbeGroups'
import KijumbeUsers from './pages/kijumbe/KijumbeUsers'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <WalletProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* User Dashboard */}
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="groups" element={<Groups />} />
                <Route path="groups/:id" element={<GroupDetails />} />
                <Route path="profile" element={<Profile />} />
                <Route path="wallet" element={<Wallet />} />
                
                {/* Admin Routes */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/groups" element={<AdminGroups />} />
                <Route path="admin/whatsapp" element={<AdminWhatsApp />} />
                
                {/* Kijumbe Routes */}
                <Route path="kijumbe" element={<KijumbeDashboard />} />
                <Route path="kijumbe/groups" element={<KijumbeGroups />} />
                <Route path="kijumbe/users" element={<KijumbeUsers />} />
              </Route>
            </Routes>
          </div>
        </WalletProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
