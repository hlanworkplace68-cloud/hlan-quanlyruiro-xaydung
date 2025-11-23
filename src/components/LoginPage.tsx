'use client';

import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent): void => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login delay
    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleDemoLogin = (demoUsername: string, demoPassword: string): void => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(demoUsername, demoPassword);
      if (!success) {
        setError('Demo login failed');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
              <LogIn className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Risk Management</h1>
            <p className="text-slate-600 text-sm mt-2">Construction Project Dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Enter username"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium placeholder:text-slate-400"
                placeholder="Enter password"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600 text-center mb-4 font-medium">Demo Accounts:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('admin', 'admin123')}
                disabled={isLoading}
                className="w-full text-left px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 text-sm"
              >
                <div className="font-semibold text-slate-800">👨‍💼 Admin</div>
                <div className="text-slate-600">Full system access</div>
                <div className="text-xs text-slate-500">admin / admin123</div>
              </button>
              <button
                onClick={() => handleDemoLogin('manager', 'manager123')}
                disabled={isLoading}
                className="w-full text-left px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 text-sm"
              >
                <div className="font-semibold text-slate-800">👨‍💼 Manager</div>
                <div className="text-slate-600">Manage projects & risks</div>
                <div className="text-xs text-slate-500">manager / manager123</div>
              </button>
              <button
                onClick={() => handleDemoLogin('viewer', 'viewer123')}
                disabled={isLoading}
                className="w-full text-left px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 text-sm"
              >
                <div className="font-semibold text-slate-800">👁️ Viewer</div>
                <div className="text-slate-600">View-only access</div>
                <div className="text-xs text-slate-500">viewer / viewer123</div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-slate-600">
            <p>Demo credentials provided. No backend authentication required.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
