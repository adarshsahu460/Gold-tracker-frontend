import React, { useState } from 'react';
import { motion } from 'framer-motion';

export type AuthView = 'login' | 'register' | 'verify';

export interface AuthProps {
  onAuthSuccess: (token: string) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [view, setView] = useState<AuthView>('login');
  const [form, setForm] = useState({ userid: '', password: '', email: '', region: '', otp: '' });
  const [message, setMessage] = useState('');
  const [useridForOtp, setUseridForOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const res = await fetch('https://api.gold-tracker.adarshsahu.site/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid: form.userid, password: form.password, email: form.email, region: form.region }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setUseridForOtp(form.userid);
      setView('verify');
    }
    setMessage(data.message || data.error);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const res = await fetch('https://api.gold-tracker.adarshsahu.site/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid: useridForOtp, otp: form.otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setView('login');
    }
    setMessage(data.message || data.error);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const res = await fetch('https://api.gold-tracker.adarshsahu.site/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid: form.userid, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.token) {
      onAuthSuccess(data.token);
    }
    setMessage(data.message || data.error);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto"
      >
        {view === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gold-700 mb-4 text-center">Login</h2>
            <input 
              name="userid" 
              placeholder="User ID" 
              value={form.userid} 
              onChange={handleChange} 
              required 
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all" 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all" 
            />
            <motion.button 
              type="submit" 
              whileTap={{ scale: 0.98 }}
              className="bg-gold-500 text-white font-semibold py-2.5 rounded-lg hover:bg-gold-600 transition shadow-sm hover:shadow"
            >
              Login
            </motion.button>
            <p className="text-center text-dark-600">
              Don't have an account? {' '}
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="text-gold-700 hover:underline font-medium"
                onClick={() => setView('register')}
              >
                Register
              </motion.button>
            </p>
            {loading && (
              <div className="flex justify-center">
                <div className="loader" />
              </div>
            )}
            {message && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-600 font-medium text-center bg-red-50 p-3 rounded-lg"
              >
                {message}
              </motion.div>
            )}
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gold-700 mb-4 text-center">Register</h2>
            <input 
              name="userid" 
              placeholder="User ID" 
              value={form.userid} 
              onChange={handleChange} 
              required 
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all" 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all" 
            />
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all" 
            />
            <select 
              name="region" 
              value={form.region} 
              onChange={handleChange} 
              required 
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all"
            >
              <option value="">Select Region</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Other">Other</option>
            </select>
            <motion.button 
              type="submit" 
              whileTap={{ scale: 0.98 }}
              className="bg-gold-500 text-white font-semibold py-2.5 rounded-lg hover:bg-gold-600 transition shadow-sm hover:shadow"
            >
              Register
            </motion.button>
            <p className="text-center text-dark-600">
              Already have an account? {' '}
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="text-gold-700 hover:underline font-medium"
                onClick={() => setView('login')}
              >
                Login
              </motion.button>
            </p>
            {loading && (
              <div className="flex justify-center">
                <div className="loader" />
              </div>
            )}
            {message && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-600 font-medium text-center bg-red-50 p-3 rounded-lg"
              >
                {message}
              </motion.div>
            )}
          </form>
        )}

        {view === 'verify' && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gold-700 mb-4 text-center">Verify OTP</h2>
            <input 
              name="otp" 
              placeholder="Enter OTP" 
              value={form.otp} 
              onChange={handleChange} 
              required 
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <motion.button 
              type="submit" 
              whileTap={{ scale: 0.98 }}
              className="bg-gold-500 text-white font-semibold py-2.5 rounded-lg hover:bg-gold-600 transition shadow-sm hover:shadow"
            >
              Verify
            </motion.button>
            {loading && (
              <div className="flex justify-center">
                <div className="loader" />
              </div>
            )}
            {message && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-600 font-medium text-center bg-red-50 p-3 rounded-lg"
              >
                {message}
              </motion.div>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}
