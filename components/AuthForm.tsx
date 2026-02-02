'use client';

import { useState } from 'react';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmCode: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (needsConfirmation) {
        const response = await fetch('/api/auth/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            code: formData.confirmCode,
            username: formData.username
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setMessage('Email confirmed! You can now sign in.');
          setNeedsConfirmation(false);
          setIsLogin(true);
        } else {
          setMessage(data.error);
        }
      } else if (isLogin) {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
        
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('accessToken', data.tokens.accessToken);
          localStorage.setItem('idToken', data.tokens.idToken);
          window.location.href = '/interview-selector';
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
            name: formData.name
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setNeedsConfirmation(true);
          setMessage('Check your email for verification code');
          setFormData({...formData, username: data.username}); // Store username
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
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {needsConfirmation ? 'Confirm Email' : isLogin ? 'Sign In' : 'Sign Up'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {needsConfirmation ? (
          <input
            type="text"
            placeholder="Confirmation Code"
            value={formData.confirmCode}
            onChange={(e) => setFormData({...formData, confirmCode: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        ) : (
          <>
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength={8}
              required
            />
          </>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Loading...' : needsConfirmation ? 'Confirm Email' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded text-center ${
          message.includes('error') || message.includes('failed') || message.includes('Invalid') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}
      
      {!needsConfirmation && (
        <p className="mt-4 text-center text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
              setFormData({ email: '', password: '', name: '', confirmCode: '', username: '' });
            }}
            className="text-blue-500 hover:underline font-medium"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      )}
    </div>
  );
}