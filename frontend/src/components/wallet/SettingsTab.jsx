import { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { 
  Settings, 
  Shield, 
  Key, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

const SettingsTab = () => {
  const { 
    wallet, 
    loading, 
    error, 
    setPin, 
    verifyPin,
    formatCurrency,
    setError 
  } = useWallet()

  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [pinResult, setPinResult] = useState(null)
  const [step, setStep] = useState(1) // 1: verify current, 2: set new

  const handleSetPin = async () => {
    if (!newPin || !confirmPin) return

    if (newPin !== confirmPin) {
      setError('PIN confirmation does not match')
      return
    }

    if (newPin.length < 4 || newPin.length > 6) {
      setError('PIN must be 4-6 digits')
      return
    }

    const result = await setPin(newPin, confirmPin)
    setPinResult(result)
  }

  const handleVerifyCurrentPin = async () => {
    if (!currentPin) return

    const result = await verifyPin(currentPin)
    if (result.success) {
      setStep(2)
      setError(null)
    } else {
      setError(result.message)
    }
  }

  const resetForm = () => {
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    setPinResult(null)
    setStep(1)
    setError(null)
  }

  if (pinResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {pinResult.success ? (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              PIN Updated Successfully
            </h3>
            <p className="text-gray-600 mb-6">
              Your wallet PIN has been updated successfully.
            </p>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              PIN Update Failed
            </h3>
            <p className="text-gray-600 mb-6">
              {pinResult.message || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Security */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Wallet Security</h3>
        </div>

        <div className="space-y-6">
          {/* PIN Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Key className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Wallet PIN</p>
                <p className="text-sm text-gray-500">
                  {wallet?.pin_set ? 'PIN is set and active' : 'No PIN set - wallet is not secure'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {wallet?.pin_set ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Secured
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unsecured
                </span>
              )}
            </div>
          </div>

          {/* PIN Management */}
          {wallet?.pin_set ? (
            // Change PIN
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Change PIN</h4>
              
              {step === 1 ? (
                // Verify current PIN
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPin ? 'text' : 'password'}
                        placeholder="Enter current PIN"
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value)}
                        maxLength="6"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPin ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyCurrentPin}
                    disabled={loading || !currentPin}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify PIN'}
                  </button>
                </div>
              ) : (
                // Set new PIN
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPin ? 'text' : 'password'}
                        placeholder="Enter new PIN (4-6 digits)"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        maxLength="6"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPin(!showNewPin)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPin ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPin ? 'text' : 'password'}
                        placeholder="Confirm new PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        maxLength="6"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPin ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSetPin}
                      disabled={loading || !newPin || !confirmPin}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Update PIN'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Set initial PIN
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Set PIN</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New PIN
                </label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    placeholder="Enter PIN (4-6 digits)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength="6"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPin ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm PIN
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    maxLength="6"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPin ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSetPin}
                disabled={loading || !newPin || !confirmPin}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting PIN...' : 'Set PIN'}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Limits */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Settings className="h-6 w-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Wallet Limits</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Daily Limit</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(wallet?.daily_limit || 0)}
              </p>
              <p className="text-sm text-gray-500">
                Remaining: {formatCurrency((wallet?.daily_limit || 0) - (wallet?.daily_spent || 0))}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Monthly Limit</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(wallet?.monthly_limit || 0)}
              </p>
              <p className="text-sm text-gray-500">
                Remaining: {formatCurrency((wallet?.monthly_limit || 0) - (wallet?.monthly_spent || 0))}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  These limits help protect your wallet from unauthorized transactions. 
                  Contact support if you need to adjust your limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Info className="h-6 w-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Wallet Information</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Wallet ID</p>
              <p className="text-sm text-gray-900 font-mono">{wallet?.$id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Currency</p>
              <p className="text-sm text-gray-900">{wallet?.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                wallet?.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {wallet?.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Created</p>
              <p className="text-sm text-gray-900">
                {wallet?.created_at ? new Date(wallet.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
