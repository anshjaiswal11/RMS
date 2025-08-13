import React from 'react';
import { useState } from 'react';
import { QrCode, Smartphone, KeyRound, CheckCircle, ArrowRight, Loader2, Copy, Mail } from 'lucide-react';

// You would replace this with the actual path to your QR code image
const YOUR_QR_CODE_IMAGE_URL = 'https://placehold.co/300x300/e2e8f0/4a5568?text=Your+QR+Code';
const API_BASE_URL = 'https://rms-backend-taupe.vercel.app/api';

const GetRMSKey = () => {
  const [utr, setUtr] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleUtrChange = (e) => {
    // Allow only alphanumeric characters for UTR
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setUtr(value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (utr.length < 12) {
      setError('Please enter a valid UTR (at least 12 characters).');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
        const response = await fetch(`${API_BASE_URL}/user/submit-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ utr, email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Submission failed. Please try again.');
        }

        console.log('Submission successful:', data);
        setIsSubmitted(true);

    } catch (err) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('UPI ID Copied!');
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Submission Received!</h1>
          <p className="text-gray-600 mb-2">
            Thank you! We have received your payment details.
          </p>
          <p className="text-gray-600">
            Your RMS API Key will be sent to your email address <strong className="text-gray-800">{email}</strong> shortly after verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <KeyRound className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Get Your RMS API Key</h1>
            <p className="text-gray-500 mt-2">Follow the steps below to get your key instantly.</p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Payment */}
            <div className="p-6 bg-gray-100 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-lg mr-4">1</div>
                <h2 className="text-xl font-semibold text-gray-800">Make Payment</h2>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <img 
                  src={"IMG_6249.jpeg"} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 rounded-lg shadow-md border-4 border-white"
                  onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x300/e2e8f0/4a5568?text=QR+Error'; }}
                />
                <div className="text-center md:text-left">
                  <p className="font-medium text-gray-700">Scan the QR code to pay:</p>
                  <p className="text-4xl font-bold text-blue-600 my-2">₹50</p>
                  <p className="text-gray-500 text-sm">Or use the UPI ID below:</p>
                  <div 
                    className="mt-2 flex items-center justify-center md:justify-start gap-2 bg-white p-2 rounded-lg border cursor-pointer hover:bg-blue-50"
                    onClick={() => copyToClipboard('anshjaiswal.@ybl')}
                  >
                    <span className="font-mono text-gray-700">anshjaiswal.@ybl</span>
                    <Copy className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Submit Details */}
            <div className="p-6 bg-gray-100 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-lg mr-4">2</div>
                <h2 className="text-xl font-semibold text-gray-800">Submit Details</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="utr" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment UTR / Transaction ID
                  </label>
                  <input
                    type="text"
                    id="utr"
                    value={utr}
                    onChange={handleUtrChange}
                    placeholder="Enter the 12-digit UTR"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Email for API key delivery"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Get API Key</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetRMSKey;
