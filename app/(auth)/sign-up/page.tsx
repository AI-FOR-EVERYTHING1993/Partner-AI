'use client';

import { useState } from 'react';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    preferredName: '',
    password: '',
    confirmPassword: '',
    confirmCode: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResendCode = async () => {
    setResendLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username })
      });
      
      const data = await response.json();
      setMessage(data.success ? data.message : data.error);
    } catch (error) {
      setMessage('Failed to resend code');
    }
    
    setResendLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      setMessage('Password must contain uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    try {
      if (needsConfirmation) {
        const response = await fetch('/api/auth/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            code: formData.confirmCode
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setMessage('Email confirmed! Redirecting to sign in...');
          setTimeout(() => {
            window.location.href = '/sign-in';
          }, 2000);
        } else {
          setMessage(data.error);
        }
      } else {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: `${formData.firstName} ${formData.lastName}`,
            preferredName: formData.preferredName || formData.firstName
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setNeedsConfirmation(true);
          setFormData({...formData, username: data.username});
          setMessage('Check your email for verification code');
        } else {
          setMessage(data.error);
        }
      }
    } catch (error) {
      setMessage('Network error occurred');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Partner AI to start practicing</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {needsConfirmation ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmation Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter code from email"
                    value={formData.confirmCode || ''}
                    onChange={(e) => setFormData({...formData, confirmCode: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading || !formData.username}
                  className="w-full mt-3 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Name
                  </label>
                  <input
                    type="text"
                    placeholder="What should we call you? (optional)"
                    value={formData.preferredName}
                    onChange={(e) => setFormData({...formData, preferredName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll use this to personalize your experience</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full p-3 pr-12 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    <p className="font-medium mb-1">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>At least 8 characters</li>
                      <li>At least one lowercase letter (a-z)</li>
                      <li>At least one uppercase letter (A-Z)</li>
                      <li>At least one number (0-9)</li>
                      <li>At least one special character (!@#$%^&*)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full p-3 pr-12 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Processing...' : needsConfirmation ? 'Confirm Email' : 'Create Account'}
            </button>
          </form>
          
          {message && (
            <div className={`mt-4 p-3 rounded text-center text-sm ${
              message.includes('error') || message.includes('failed') || message.includes('do not match') || message.includes('must be')
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}>
              {message}
              {message.includes('already exists') && (
                <div className="mt-3">
                  <a 
                    href="/sign-in" 
                    className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors font-medium"
                  >
                    Go to Sign In
                  </a>
                </div>
              )}
            </div>
          )}
          
          {!needsConfirmation && (
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <a href="/sign-in" className="text-green-500 hover:underline font-medium">
                Sign In
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}