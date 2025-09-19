import React, { useState, useEffect } from 'react';
import { X, Copy, Share2, QrCode, Download, Check } from 'lucide-react';
import QRCode from 'qrcode.react';

interface ReceiveMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const ReceiveMoneyModal: React.FC<ReceiveMoneyModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate a unique payment link or QR data
      const paymentData = {
        type: 'payment_request',
        email: userEmail,
        timestamp: Date.now(),
        amount: null, // Let sender specify amount
      };
      setQrCodeData(JSON.stringify(paymentData));
    }
  }, [isOpen, userEmail]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sharePaymentRequest = async () => {
    const shareData = {
      title: 'Payment Request',
      text: `Send money to ${userEmail}`,
      url: window.location.origin + `/pay?email=${encodeURIComponent(userEmail)}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying
      copyToClipboard(shareData.url);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('#qr-code canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `payment-request-${userEmail}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Receive Money</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block">
              <div id="qr-code">
                <QRCode
                  value={qrCodeData}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Scan this QR code to send money
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Ready to receive</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button
              onClick={() => copyToClipboard(userEmail)}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Email
                </>
              )}
            </button>

            <button
              onClick={sharePaymentRequest}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Payment Request
            </button>

            <button
              onClick={downloadQRCode}
              className="w-full flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How to receive money:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Share your email or QR code with the sender</li>
              <li>• The sender will send money to your email</li>
              <li>• Money will appear in your wallet instantly</li>
              <li>• You'll receive a notification when payment arrives</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoneyModal;
