import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const { register } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating circles */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-10 h-32 w-32 -rotate-45 rounded-lg bg-white/5 border border-white/10"></div>
        <div className="absolute bottom-20 left-10 h-24 w-24 -rotate-12 rounded-full bg-white/5 border border-white/10"></div>
        <div className="absolute top-1/2 right-1/4 h-16 w-16 -rotate-45 rounded-lg bg-white/5 border border-white/10"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 right-1/4 h-2 w-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/3 left-1/4 h-2 w-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 h-2 w-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-2/3 left-1/3 h-2 w-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
        
        {/* Decorative lines */}
        <div className="absolute top-0 left-1/4 h-full w-px bg-white/5"></div>
        <div className="absolute top-0 right-1/4 h-full w-px bg-white/5"></div>
      </div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card with glassmorphism effect */}
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border border-white/20">
          {/* Logo/Brand */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">Join Cryptalk for secure collaboration</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="John Doe"
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200 disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-600 transition-colors hover:text-purple-700 hover:underline">
              Sign in
            </Link>
          </p>

          {/* Security badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🔒</span>
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🛡️</span>
              <span>Secure Storage</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🔐</span>
              <span>Blockchain Audit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;