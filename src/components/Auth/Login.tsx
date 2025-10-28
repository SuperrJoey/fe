import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err: any) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-500 to-purple-700 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-center text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="mt-1 text-center text-gray-500">Sign in to your Cryptalk account</p>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required disabled={loading}
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required disabled={loading}
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 outline-none focus:border-indigo-500"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;