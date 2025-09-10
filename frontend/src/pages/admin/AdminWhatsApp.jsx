import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { 
  MessageSquare, 
  Send, 
  Users, 
  Settings, 
  Bot, 
  Phone, 
  Mail, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Trash2,
  Upload,
  BarChart3,
  Wifi,
  WifiOff,
  Image,
  FileText,
  List,
  MessageCircle,
  Eye,
  Play,
  Pause,
  Zap,
  Globe,
  Link,
  History,
  TestTube
} from 'lucide-react'

const AdminWhatsApp = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected')
  const [botSettings, setBotSettings] = useState({
    enabled: false,
    welcomeMessage: 'Welcome to Kijumbe! How can I help you today?',
    autoReply: true
  })
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeUsers: 0,
    groupsConnected: 0
  })
  const [queueStatus, setQueueStatus] = useState({
    totalMessages: 0,
    processing: 0,
    pending: 0,
    failed: 0
  })
  const [instanceInfo, setInstanceInfo] = useState({
    instanceId: '',
    status: 'unknown',
    isConnected: false,
    lastChecked: null
  })
  const [recentMessages, setRecentMessages] = useState([])
  const [showSendMessage, setShowSendMessage] = useState(false)
  const [sendMessageData, setSendMessageData] = useState({
    phoneNumber: '',
    message: '',
    messageType: 'text'
  })
  const [showBulkMessage, setShowBulkMessage] = useState(false)
  const [bulkMessageData, setBulkMessageData] = useState({
    recipients: '',
    message: ''
  })
  const [showMediaMessage, setShowMediaMessage] = useState(false)
  const [mediaMessageData, setMediaMessageData] = useState({
    phoneNumber: '',
    mediaUrl: '',
    caption: '',
    mediaType: 'image'
  })
  const [showInteractiveMessage, setShowInteractiveMessage] = useState(false)
  const [interactiveMessageData, setInteractiveMessageData] = useState({
    phoneNumber: '',
    message: '',
    messageType: 'buttons', // buttons or list
    buttons: [{ text: '', id: '' }],
    listSections: []
  })
  const [showMessageHistory, setShowMessageHistory] = useState(false)
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('')
  const [messageHistory, setMessageHistory] = useState([])
  const [showWebhookConfig, setShowWebhookConfig] = useState(false)
  const [webhookConfig, setWebhookConfig] = useState({
    webhookUrl: '',
    webhookToken: ''
  })
  const [showBotCommands, setShowBotCommands] = useState(false)
  const [botCommands, setBotCommands] = useState([
    { command: 'hi', description: 'Start conversation', response: 'Welcome message' },
    { command: 'menu', description: 'Show help menu', response: 'Full menu' },
    { command: 'kiongozi', description: 'Choose leader role', response: 'Leader options' },
    { command: 'mwanachama', description: 'Choose member role', response: 'Member options' },
    { command: 'toa [amount]', description: 'Make contribution', response: 'Contribution guide' },
    { command: 'salio', description: 'Check balance', response: 'Balance info' },
    { command: 'vikundi', description: 'View groups', response: 'Groups list' },
    { command: 'msaada', description: 'Get help', response: 'Help information' }
  ])

  useEffect(() => {
    fetchWhatsAppData()
  }, [])

  const fetchWhatsAppData = async () => {
    setLoading(true)
    try {
      // Fetch WhatsApp bot status and settings
      const [statusResponse, statsResponse, queueResponse] = await Promise.all([
        api.get('/whatsapp/status'),
        api.get('/whatsapp/statistics'),
        api.get('/whatsapp/queue-status')
      ])
      
      if (statusResponse.data.success) {
        setWhatsappStatus(statusResponse.data.data.status)
        setBotSettings(statusResponse.data.data.settings)
        setStats(statusResponse.data.data.stats)
        setInstanceInfo(statusResponse.data.data.instanceInfo)
      }
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data.stats)
        setRecentMessages(statsResponse.data.data.recentMessages || [])
      }
      
      if (queueResponse.data.success) {
        setQueueStatus(queueResponse.data.data.queueStatus)
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp data:', error)
      // Set default values if API fails
      setWhatsappStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchWhatsAppData()
    setRefreshing(false)
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await api.post('/whatsapp/test-connection')
      if (response.data.success) {
        alert('Connection test successful!')
        await fetchWhatsAppData()
      } else {
        alert('Connection test failed: ' + response.data.message)
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      alert('Connection test failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const clearQueue = async () => {
    if (!window.confirm('Are you sure you want to clear the message queue?')) return
    
    setLoading(true)
    try {
      const response = await api.post('/whatsapp/clear-queue')
      if (response.data.success) {
        alert('Message queue cleared successfully!')
        await fetchWhatsAppData()
      } else {
        alert('Failed to clear queue: ' + response.data.message)
      }
    } catch (error) {
      console.error('Clear queue failed:', error)
      alert('Failed to clear queue: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleBot = async () => {
    setLoading(true)
    try {
      const response = await api.post('/admin/whatsapp/toggle', {
        enabled: !botSettings.enabled
      })
      if (response.data.success) {
        setBotSettings(prev => ({ ...prev, enabled: !prev.enabled }))
      }
    } catch (error) {
      console.error('Failed to toggle bot:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings) => {
    setLoading(true)
    try {
      const response = await api.post('/admin/whatsapp/settings', newSettings)
      if (response.data.success) {
        setBotSettings(prev => ({ ...prev, ...newSettings }))
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestMessage = async () => {
    setLoading(true)
    try {
      const response = await api.post('/admin/whatsapp/test')
      if (response.data.success) {
        alert('Test message sent successfully!')
      }
    } catch (error) {
      console.error('Failed to send test message:', error)
      alert('Failed to send test message')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!sendMessageData.phoneNumber || !sendMessageData.message) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/whatsapp/send', sendMessageData)
      if (response.data.success) {
        alert('Message sent successfully!')
        setSendMessageData({ phoneNumber: '', message: '', messageType: 'text' })
        setShowSendMessage(false)
        await fetchWhatsAppData()
      } else {
        alert('Failed to send message: ' + response.data.message)
      }
    } catch (error) {
      console.error('Send message failed:', error)
      alert('Failed to send message: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendBulkMessage = async () => {
    if (!bulkMessageData.recipients || !bulkMessageData.message) {
      alert('Please fill in all required fields')
      return
    }

    // Parse recipients (comma-separated phone numbers)
    const recipients = bulkMessageData.recipients
      .split(',')
      .map(phone => ({ phoneNumber: phone.trim() }))
      .filter(recipient => recipient.phoneNumber)

    if (recipients.length === 0) {
      alert('Please provide valid phone numbers')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/whatsapp/send-bulk', {
        recipients,
        message: bulkMessageData.message
      })
      if (response.data.success) {
        alert(`Bulk message processing initiated for ${recipients.length} recipients!`)
        setBulkMessageData({ recipients: '', message: '' })
        setShowBulkMessage(false)
        await fetchWhatsAppData()
      } else {
        alert('Failed to send bulk message: ' + response.data.message)
      }
    } catch (error) {
      console.error('Send bulk message failed:', error)
      alert('Failed to send bulk message: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMediaMessage = async () => {
    if (!mediaMessageData.phoneNumber || !mediaMessageData.mediaUrl) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/whatsapp/send-media', {
        phoneNumber: mediaMessageData.phoneNumber,
        mediaUrl: mediaMessageData.mediaUrl,
        caption: mediaMessageData.caption,
        mediaType: mediaMessageData.mediaType
      })
      if (response.data.success) {
        alert('Media message sent successfully!')
        setMediaMessageData({ phoneNumber: '', mediaUrl: '', caption: '', mediaType: 'image' })
        setShowMediaMessage(false)
        await fetchWhatsAppData()
      } else {
        alert('Failed to send media message: ' + response.data.message)
      }
    } catch (error) {
      console.error('Send media message failed:', error)
      alert('Failed to send media message: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendInteractiveMessage = async () => {
    if (!interactiveMessageData.phoneNumber || !interactiveMessageData.message) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const payload = {
        phoneNumber: interactiveMessageData.phoneNumber,
        message: interactiveMessageData.message,
        messageType: interactiveMessageData.messageType
      }

      if (interactiveMessageData.messageType === 'buttons') {
        payload.buttons = interactiveMessageData.buttons.filter(btn => btn.text && btn.id)
      } else if (interactiveMessageData.messageType === 'list') {
        payload.sections = interactiveMessageData.listSections
      }

      const response = await api.post('/whatsapp/send-interactive', payload)
      if (response.data.success) {
        alert('Interactive message sent successfully!')
        setInteractiveMessageData({
          phoneNumber: '',
          message: '',
          messageType: 'buttons',
          buttons: [{ text: '', id: '' }],
          listSections: []
        })
        setShowInteractiveMessage(false)
        await fetchWhatsAppData()
      } else {
        alert('Failed to send interactive message: ' + response.data.message)
      }
    } catch (error) {
      console.error('Send interactive message failed:', error)
      alert('Failed to send interactive message: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessageHistory = async (phoneNumber) => {
    if (!phoneNumber) return

    setLoading(true)
    try {
      const response = await api.get(`/whatsapp/chat-history/${phoneNumber}`)
      if (response.data.success) {
        setMessageHistory(response.data.data.messages || [])
        setSelectedPhoneNumber(phoneNumber)
        setShowMessageHistory(true)
      } else {
        alert('Failed to fetch message history: ' + response.data.message)
      }
    } catch (error) {
      console.error('Fetch message history failed:', error)
      alert('Failed to fetch message history: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateWebhookConfig = async () => {
    if (!webhookConfig.webhookUrl) {
      alert('Please provide a webhook URL')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/whatsapp/webhook-config', webhookConfig)
      if (response.data.success) {
        alert('Webhook configuration updated successfully!')
        setShowWebhookConfig(false)
        await fetchWhatsAppData()
      } else {
        alert('Failed to update webhook: ' + response.data.message)
      }
    } catch (error) {
      console.error('Update webhook failed:', error)
      alert('Failed to update webhook: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testBotCommand = async (command) => {
    setLoading(true)
    try {
      const response = await api.post('/whatsapp/test-command', { command })
      if (response.data.success) {
        alert(`Command "${command}" test successful!`)
      } else {
        alert(`Command "${command}" test failed: ` + response.data.message)
      }
    } catch (error) {
      console.error('Test command failed:', error)
      alert('Test command failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addButton = () => {
    setInteractiveMessageData(prev => ({
      ...prev,
      buttons: [...prev.buttons, { text: '', id: '' }]
    }))
  }

  const removeButton = (index) => {
    setInteractiveMessageData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }))
  }

  const updateButton = (index, field, value) => {
    setInteractiveMessageData(prev => ({
      ...prev,
      buttons: prev.buttons.map((btn, i) => 
        i === index ? { ...btn, [field]: value } : btn
      )
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="mr-3 h-8 w-8 text-primary-600" />
              WhatsApp Integration
            </h1>
            <p className="text-gray-600 mt-1">Manage WhatsApp bot and messaging features</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Test Connection
            </button>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
              whatsappStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {whatsappStatus === 'connected' ? (
                <Wifi className="h-4 w-4 mr-1" />
              ) : (
                <WifiOff className="h-4 w-4 mr-1" />
              )}
              {whatsappStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={toggleBot}
              disabled={loading}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                botSettings.enabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {botSettings.enabled ? 'Disable Bot' : 'Enable Bot'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Groups Connected</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.groupsConnected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Queue Status</p>
              <p className="text-2xl font-semibold text-gray-900">{queueStatus.totalMessages}</p>
              <p className="text-xs text-gray-500">
                {queueStatus.pending} pending, {queueStatus.processing} processing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Monitoring */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Message Queue
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={clearQueue}
              disabled={loading || queueStatus.totalMessages === 0}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Queue
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{queueStatus.totalMessages}</div>
            <div className="text-sm text-gray-500">Total Messages</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{queueStatus.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{queueStatus.processing}</div>
            <div className="text-sm text-gray-500">Processing</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{queueStatus.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </div>

      {/* Bot Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Bot Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message
            </label>
            <textarea
              value={botSettings.welcomeMessage}
              onChange={(e) => setBotSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Enter welcome message for new users"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoReply"
              checked={botSettings.autoReply}
              onChange={(e) => setBotSettings(prev => ({ ...prev, autoReply: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="autoReply" className="ml-2 block text-sm text-gray-900">
              Enable auto-reply for common questions
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => updateSettings(botSettings)}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              Save Settings
            </button>
            <button
              onClick={sendTestMessage}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Send Test Message
            </button>
          </div>
        </div>
      </div>

      {/* Message Sending */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Send className="mr-2 h-5 w-5" />
          Send Messages
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setShowSendMessage(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Send className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Send Text Message</p>
              <p className="text-sm text-gray-500">Send a text message to one recipient</p>
            </div>
          </button>

          <button
            onClick={() => setShowBulkMessage(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Send Bulk Messages</p>
              <p className="text-sm text-gray-500">Send messages to multiple recipients</p>
            </div>
          </button>

          <button
            onClick={() => setShowMediaMessage(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Image className="h-6 w-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Send Media Message</p>
              <p className="text-sm text-gray-500">Send images, documents, or videos</p>
            </div>
          </button>

          <button
            onClick={() => setShowInteractiveMessage(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <List className="h-6 w-6 text-orange-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Send Interactive Message</p>
              <p className="text-sm text-gray-500">Send buttons or list messages</p>
            </div>
          </button>

          <button
            onClick={() => setShowMessageHistory(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History className="h-6 w-6 text-indigo-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Message History</p>
              <p className="text-sm text-gray-500">Check conversation history</p>
            </div>
          </button>

          <button
            onClick={() => setShowBotCommands(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TestTube className="h-6 w-6 text-red-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Test Bot Commands</p>
              <p className="text-sm text-gray-500">Test bot responses</p>
            </div>
          </button>
        </div>
      </div>

      {/* Instance Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Green API Instance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Instance Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Instance ID:</span>
                <span className="text-sm font-mono text-gray-900">{instanceInfo.instanceId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  instanceInfo.status === 'authorized' 
                    ? 'text-green-600' 
                    : instanceInfo.status === 'notAuthorized'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}>
                  {instanceInfo.status || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connected:</span>
                <span className={`text-sm font-medium ${
                  instanceInfo.isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {instanceInfo.isConnected ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Last Checked</h3>
            <p className="text-sm text-gray-900">
              {instanceInfo.lastChecked 
                ? new Date(instanceInfo.lastChecked).toLocaleString()
                : 'Never'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open('https://wa.me/255738071080', '_blank')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Phone className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Open WhatsApp Web</p>
              <p className="text-sm text-gray-500">Access WhatsApp in your browser</p>
            </div>
          </button>

          <button
            onClick={() => setShowWebhookConfig(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Link className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Configure Webhook</p>
              <p className="text-sm text-gray-500">Update webhook settings</p>
            </div>
          </button>

          <button
            onClick={() => window.open('mailto:support@kijumbe.com', '_blank')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-6 w-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Contact Support</p>
              <p className="text-sm text-gray-500">Get help with WhatsApp integration</p>
            </div>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">WhatsApp API</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              whatsappStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {whatsappStatus === 'connected' ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Bot Service</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              botSettings.enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {botSettings.enabled ? 'Running' : 'Stopped'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Last Updated</span>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Send Message Modal */}
      {showSendMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={sendMessageData.phoneNumber}
                  onChange={(e) => setSendMessageData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 255738071080"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={sendMessageData.message}
                  onChange={(e) => setSendMessageData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  placeholder="Enter your message here..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSendMessage(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Message Modal */}
      {showBulkMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Bulk Messages</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Numbers (comma-separated)
                </label>
                <textarea
                  value={bulkMessageData.recipients}
                  onChange={(e) => setBulkMessageData(prev => ({ ...prev, recipients: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="255738071080, 255123456789, 255987654321"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={bulkMessageData.message}
                  onChange={(e) => setBulkMessageData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  placeholder="Enter your message here..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBulkMessage(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendBulkMessage}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Bulk Messages'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Message Modal */}
      {showMediaMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Media Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={mediaMessageData.phoneNumber}
                  onChange={(e) => setMediaMessageData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 255738071080"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Type
                </label>
                <select
                  value={mediaMessageData.mediaType}
                  onChange={(e) => setMediaMessageData(prev => ({ ...prev, mediaType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="image">Image</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media URL
                </label>
                <input
                  type="url"
                  value={mediaMessageData.mediaUrl}
                  onChange={(e) => setMediaMessageData(prev => ({ ...prev, mediaUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (Optional)
                </label>
                <textarea
                  value={mediaMessageData.caption}
                  onChange={(e) => setMediaMessageData(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Enter caption for your media..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMediaMessage(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendMediaMessage}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Media'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Message Modal */}
      {showInteractiveMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Interactive Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={interactiveMessageData.phoneNumber}
                  onChange={(e) => setInteractiveMessageData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 255738071080"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Type
                </label>
                <select
                  value={interactiveMessageData.messageType}
                  onChange={(e) => setInteractiveMessageData(prev => ({ ...prev, messageType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="buttons">Buttons</option>
                  <option value="list">List</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={interactiveMessageData.message}
                  onChange={(e) => setInteractiveMessageData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Enter your message here..."
                />
              </div>
              
              {interactiveMessageData.messageType === 'buttons' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Buttons
                    </label>
                    <button
                      onClick={addButton}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                    >
                      Add Button
                    </button>
                  </div>
                  {interactiveMessageData.buttons.map((button, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={button.text}
                        onChange={(e) => updateButton(index, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Button text"
                      />
                      <input
                        type="text"
                        value={button.id}
                        onChange={(e) => updateButton(index, 'id', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Button ID"
                      />
                      <button
                        onClick={() => removeButton(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInteractiveMessage(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendInteractiveMessage}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Interactive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message History Modal */}
      {showMessageHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message History</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    value={selectedPhoneNumber}
                    onChange={(e) => setSelectedPhoneNumber(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 255738071080"
                  />
                  <button
                    onClick={() => fetchMessageHistory(selectedPhoneNumber)}
                    disabled={loading || !selectedPhoneNumber}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load History'}
                  </button>
                </div>
              </div>
              
              {messageHistory.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <h4 className="font-medium text-gray-900 mb-3">Conversation with {selectedPhoneNumber}</h4>
                  <div className="space-y-3">
                    {messageHistory.map((message, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        message.direction === 'outgoing' 
                          ? 'bg-blue-50 ml-8' 
                          : 'bg-gray-50 mr-8'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {message.direction === 'outgoing' ? 'Bot' : 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{message.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMessageHistory(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Configuration Modal */}
      {showWebhookConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookConfig.webhookUrl}
                  onChange={(e) => setWebhookConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://your-domain.com/backend/whatsapp/webhook"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Token (Optional)
                </label>
                <input
                  type="text"
                  value={webhookConfig.webhookToken}
                  onChange={(e) => setWebhookConfig(prev => ({ ...prev, webhookToken: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your webhook secret token"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Make sure your webhook URL is publicly accessible and can receive POST requests from GreenAPI.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWebhookConfig(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateWebhookConfig}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bot Commands Modal */}
      {showBotCommands && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Commands & Testing</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Available Bot Commands</h4>
                <p className="text-sm text-blue-800">
                  Test these commands to verify the bot is responding correctly to user messages.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {botCommands.map((cmd, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">/{cmd.command}</h5>
                        <p className="text-sm text-gray-600">{cmd.description}</p>
                      </div>
                      <button
                        onClick={() => testBotCommand(cmd.command)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Test
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Response: {cmd.response}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Quick Test</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Send a test message to the bot number (255738071080) with any of these commands to see the responses.
                </p>
                <div className="flex flex-wrap gap-2">
                  {botCommands.slice(0, 4).map((cmd, index) => (
                    <span key={index} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">
                      {cmd.command}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBotCommands(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWhatsApp
