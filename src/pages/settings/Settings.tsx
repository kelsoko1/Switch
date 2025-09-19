import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { appwrite } from '@/lib/appwrite';
import { walletService } from '@/services/appwrite';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings as SettingsIcon,
  Shield, 
  Bell, 
  Wallet, 
  Camera,
  Lock,
  LogOut,
  Save,
  X,
  Check,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Globe
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  // isLoading state is kept for future use but not currently used
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [phone, setPhone] = useState('');
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Wallet settings
  const [dailyLimit, setDailyLimit] = useState(100000);
  const [monthlyLimit, setMonthlyLimit] = useState(1000000);
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState('mobile_money');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  
  // App preferences
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState('medium');
  
  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    
    try {
      // Update name if changed
      if (name !== user?.name) {
        await appwrite.updateName(name);
      }
      
      // Show success message
      setSuccess('Profile updated successfully');
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    
    // Validate password
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsSaving(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsSaving(false);
      return;
    }
    
    try {
      // Update password
      await appwrite.updatePassword(newPassword, currentPassword);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      setSuccess('Password changed successfully');
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle wallet settings update
  const handleUpdateWalletSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    
    try {
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }
      
      // Get user wallet
      const wallet = await walletService.getUserWallet(user.$id);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Update wallet settings
      await walletService.updateWalletSettings(
        wallet.$id,
        {
          daily_limit: dailyLimit,
          monthly_limit: monthlyLimit,
          updated_at: new Date().toISOString()
        }
      );
      
      // Show success message
      setSuccess('Wallet settings updated successfully');
      toast({
        title: 'Wallet Settings Updated',
        description: 'Your wallet settings have been updated successfully.',
      });
    } catch (err: any) {
      console.error('Error updating wallet settings:', err);
      setError(err.message || 'Failed to update wallet settings');
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update wallet settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle notification settings update
  const handleUpdateNotificationSettings = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);
    
    try {
      // In a real application, we would call an API to update notification settings
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess('Notification settings updated successfully');
      toast({
        title: 'Notification Settings Updated',
        description: 'Your notification preferences have been updated successfully.',
      });
    } catch (err: any) {
      console.error('Error updating notification settings:', err);
      setError(err.message || 'Failed to update notification settings');
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update notification settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle app preferences update
  const handleUpdateAppPreferences = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);
    
    try {
      // In a real application, we would call an API to update app preferences
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess('App preferences updated successfully');
      toast({
        title: 'App Preferences Updated',
        description: 'Your app preferences have been updated successfully.',
      });
    } catch (err: any) {
      console.error('Error updating app preferences:', err);
      setError(err.message || 'Failed to update app preferences');
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update app preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'wallet', name: 'Wallet', icon: Wallet },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
  ];

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Sign In Required</h2>
          <p className="text-gray-500 mb-6">Please sign in to access your settings.</p>
          <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white border-r md:h-[calc(100vh-5rem)]">
          <nav className="p-4">
            <ul className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{tab.name}</span>
                    </button>
                  </li>
                );
              })}
              <li className="mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Log Out</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <X className="w-5 h-5 mr-2 text-red-500" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              {success}
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Settings</h2>
              
              <div className="mb-8 flex flex-col items-center md:flex-row md:items-start">
                <div className="relative mb-4 md:mb-0 md:mr-8">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                    title="Change profile picture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 w-full">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        placeholder="Your email address"
                      />
                      <p className="text-xs text-gray-500 mt-1">Contact support to change your email address</p>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your phone number"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSaving || name === user?.name}
                        className="flex items-center"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                        {!isSaving && <Save className="ml-2 w-4 h-4" />}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
              
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your new password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                      className="flex items-center"
                    >
                      {isSaving ? 'Changing Password...' : 'Change Password'}
                      {!isSaving && <Lock className="ml-2 w-4 h-4" />}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Two-Factor Authentication</h3>
                <p className="text-gray-500 mb-4">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                <Button variant="outline" disabled>
                  Set Up Two-Factor Authentication
                </Button>
                <p className="text-xs text-gray-500 mt-2">This feature will be available soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Wallet Settings</h2>
              
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Transaction Limits</h3>
                <form onSubmit={handleUpdateWalletSettings} className="space-y-4">
                  <div>
                    <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Transaction Limit (TZS)
                    </label>
                    <input
                      id="dailyLimit"
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1000"
                      max="10000000"
                      step="1000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Set the maximum amount you can transact in a single day</p>
                  </div>
                  
                  <div>
                    <label htmlFor="monthlyLimit" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Transaction Limit (TZS)
                    </label>
                    <input
                      id="monthlyLimit"
                      type="number"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="10000"
                      max="100000000"
                      step="10000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Set the maximum amount you can transact in a month</p>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex items-center"
                    >
                      {isSaving ? 'Saving...' : 'Save Limits'}
                      {!isSaving && <Save className="ml-2 w-4 h-4" />}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Preferred Payment Method</h3>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="mobile_money"
                        type="radio"
                        name="paymentMethod"
                        value="mobile_money"
                        checked={preferredPaymentMethod === 'mobile_money'}
                        onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <label htmlFor="mobile_money" className="ml-2 block text-sm text-gray-700">
                        Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="bank_transfer"
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={preferredPaymentMethod === 'bank_transfer'}
                        onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <label htmlFor="bank_transfer" className="ml-2 block text-sm text-gray-700">
                        Bank Transfer
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="card_payment"
                        type="radio"
                        name="paymentMethod"
                        value="card_payment"
                        checked={preferredPaymentMethod === 'card_payment'}
                        onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <label htmlFor="card_payment" className="ml-2 block text-sm text-gray-700">
                        Credit/Debit Card
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="button" 
                      onClick={handleUpdateWalletSettings}
                      disabled={isSaving}
                      className="flex items-center"
                    >
                      {isSaving ? 'Saving...' : 'Save Payment Preference'}
                      {!isSaving && <Save className="ml-2 w-4 h-4" />}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Auto Top-up Settings</h3>
                <p className="text-gray-500 mb-4">Configure automatic top-up when your balance falls below a certain amount.</p>
                <Button variant="outline" disabled>
                  Configure Auto Top-up
                </Button>
                <p className="text-xs text-gray-500 mt-2">This feature will be available soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Preferences</h2>
              
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                      <p className="text-xs text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailNotifications}
                        onChange={() => setEmailNotifications(!emailNotifications)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Push Notifications</h4>
                      <p className="text-xs text-gray-500">Receive notifications on your device</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pushNotifications}
                        onChange={() => setPushNotifications(!pushNotifications)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Transaction Alerts</h4>
                      <p className="text-xs text-gray-500">Receive notifications about your transactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={transactionAlerts}
                        onChange={() => setTransactionAlerts(!transactionAlerts)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Security Alerts</h4>
                      <p className="text-xs text-gray-500">Receive notifications about security events</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={securityAlerts}
                        onChange={() => setSecurityAlerts(!securityAlerts)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Marketing Emails</h4>
                      <p className="text-xs text-gray-500">Receive promotional emails and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={marketingEmails}
                        onChange={() => setMarketingEmails(!marketingEmails)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleUpdateNotificationSettings}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  {isSaving ? 'Saving...' : 'Save Notification Preferences'}
                  {!isSaving && <Save className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">App Preferences</h2>
              
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`border rounded-lg p-4 flex items-center cursor-pointer ${theme === 'light' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="w-6 h-6 mr-3 text-yellow-500" />
                    <div>
                      <h4 className="font-medium text-gray-800">Light Mode</h4>
                      <p className="text-xs text-gray-500">Bright theme for daytime use</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 flex items-center cursor-pointer ${theme === 'dark' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="w-6 h-6 mr-3 text-indigo-500" />
                    <div>
                      <h4 className="font-medium text-gray-800">Dark Mode</h4>
                      <p className="text-xs text-gray-500">Dark theme for nighttime use</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Language</h3>
                <div className="mb-4">
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>Changing language will reload the application</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Text Size</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="small"
                      type="radio"
                      name="fontSize"
                      value="small"
                      checked={fontSize === 'small'}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <label htmlFor="small" className="ml-2 block text-sm text-gray-700">
                      Small
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="medium"
                      type="radio"
                      name="fontSize"
                      value="medium"
                      checked={fontSize === 'medium'}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <label htmlFor="medium" className="ml-2 block text-sm text-gray-700">
                      Medium (Recommended)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="large"
                      type="radio"
                      name="fontSize"
                      value="large"
                      checked={fontSize === 'large'}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <label htmlFor="large" className="ml-2 block text-sm text-gray-700">
                      Large
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleUpdateAppPreferences}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  {isSaving ? 'Saving...' : 'Save App Preferences'}
                  {!isSaving && <Save className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;