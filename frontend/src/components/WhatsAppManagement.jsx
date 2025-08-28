import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WhatsAppManagement = () => {
  const [status, setStatus] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [messages, setMessages] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);
  const [instanceInfo, setInstanceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [bulkPhoneNumbers, setBulkPhoneNumbers] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [activeTab, setActiveTab] = useState('status');

  const API_BASE = '/backend/whatsapp';

  useEffect(() => {
    fetchStatus();
    fetchQueueStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      alert(`Failed to fetch status: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/queue-status`);
      setQueueStatus(response.data.queueStatus);
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
      alert(`Failed to fetch queue status: ${error.response?.data?.error || error.message}`);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/statistics`);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      alert(`Failed to fetch statistics: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/messages?limit=20`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      alert(`Failed to fetch messages: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstanceInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/instance-info`);
      setInstanceInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch instance info:', error);
      alert(`Failed to fetch instance info: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      alert('Please enter both phone number and message');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/test-connection`, {
        phoneNumber: testPhone
      });
      alert('Test message sent successfully!');
      setTestMessage('');
    } catch (error) {
      alert(`Failed to send test message: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendBulkNotification = async () => {
    if (!bulkPhoneNumbers || !bulkMessage) {
      alert('Please enter both phone numbers and message');
      return;
    }

    const phoneNumbers = bulkPhoneNumbers.split(',').map(p => p.trim()).filter(p => p);
    if (phoneNumbers.length === 0) {
      alert('Please enter valid phone numbers');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/send-bulk-notification`, {
        phoneNumbers,
        message: bulkMessage
      });
      alert(`Bulk notification sent! ${response.data.successful} successful, ${response.data.failed} failed`);
      setBulkMessage('');
      setBulkPhoneNumbers('');
    } catch (error) {
      alert(`Failed to send bulk notification: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearQueue = async () => {
    if (!confirm('Are you sure you want to clear the message queue?')) return;

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/clear-queue`);
      alert(`Queue cleared! ${response.data.clearedCount} messages removed`);
      fetchQueueStatus();
    } catch (error) {
      alert(`Failed to clear queue: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateWebhookUrl = async () => {
    const newUrl = prompt('Enter new webhook URL:');
    if (!newUrl) return;

    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE}/webhook-url`, {
        webhookUrl: newUrl
      });
      alert('Webhook URL updated successfully!');
      fetchStatus();
    } catch (error) {
      alert(`Failed to update webhook URL: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Bot Status</h3>
        {status ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Status:</strong> {status.status}</p>
              <p><strong>Bot Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  status.botStatus === 'authorized' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.botStatus}
                </span>
              </p>
              <p><strong>Bot Phone:</strong> {status.botPhone}</p>
              <p><strong>Instance ID:</strong> {status.instanceId}</p>
            </div>
            <div>
              <p><strong>Webhook URL:</strong> {status.webhookUrl}</p>
              <p><strong>Timestamp:</strong> {new Date(status.timestamp).toLocaleString()}</p>
              {status.note && <p className="text-yellow-600 text-sm">{status.note}</p>}
            </div>
          </div>
        ) : (
          <p>Loading status...</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Queue Status</h3>
        {queueStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Queue Length:</strong> {queueStatus.queueLength}</p>
              <p><strong>Processing:</strong> {queueStatus.isProcessing ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p><strong>Rate Limit Counter:</strong> {queueStatus.rateLimitCounter}</p>
              <p><strong>Reset Time:</strong> {new Date(queueStatus.rateLimitResetTime).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <p>Loading queue status...</p>
        )}
        <div className="mt-4 space-x-2">
          <button
            onClick={clearQueue}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Clear Queue
          </button>
          <button
            onClick={fetchQueueStatus}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-x-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Refresh Status
          </button>
          <button
            onClick={updateWebhookUrl}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Update Webhook
          </button>
          <button
            onClick={fetchInstanceInfo}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Instance Info
          </button>
        </div>
      </div>
    </div>
  );

  const renderStatisticsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Message Statistics</h3>
      {statistics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalIncoming}</div>
            <div className="text-sm text-gray-600">Incoming</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{statistics.totalOutgoing}</div>
            <div className="text-sm text-gray-600">Outgoing</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{statistics.successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">{statistics.totalMessages}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={fetchStatistics}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Load Statistics
          </button>
        </div>
      )}
    </div>
  );

  const renderMessagesTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Messages</h3>
      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.$id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{message.phone_number}</p>
                  <p className="text-sm text-gray-600">{message.message}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p className={`px-2 py-1 rounded ${
                    message.type === 'incoming' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {message.type}
                  </p>
                  <p>{new Date(message.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Load Messages
          </button>
        </div>
      )}
    </div>
  );

  const renderTestTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Send Test Message</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (with country code)
            </label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+255738071080"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Message
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter your test message here..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={sendTestMessage}
            disabled={loading || !testPhone || !testMessage}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Send Test Message
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Send Bulk Notification</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Numbers (comma-separated)
            </label>
            <input
              type="text"
              value={bulkPhoneNumbers}
              onChange={(e) => setBulkPhoneNumbers(e.target.value)}
              placeholder="+255738071080, +255738071081, +255738071082"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={sendBulkNotification}
            disabled={loading || !bulkPhoneNumbers || !bulkMessage}
            className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Send Bulk Notification
          </button>
        </div>
      </div>
    </div>
  );

  const renderInstanceInfoTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Instance Information</h3>
      {instanceInfo ? (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">Status</h4>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(instanceInfo.status, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Settings</h4>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(instanceInfo.settings, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Configuration</h4>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(instanceInfo.config, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={fetchInstanceInfo}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Load Instance Info
          </button>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'status', label: 'Status', component: renderStatusTab },
    { id: 'statistics', label: 'Statistics', component: renderStatisticsTab },
    { id: 'messages', label: 'Messages', component: renderMessagesTab },
    { id: 'test', label: 'Test & Send', component: renderTestTab },
    { id: 'instance', label: 'Instance Info', component: renderInstanceInfoTab }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your WhatsApp bot integration, monitor status, and send messages
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find(tab => tab.id === activeTab)?.component()}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppManagement;
