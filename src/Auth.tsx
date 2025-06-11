import React, { useState } from 'react';

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
    const res = await fetch('http://localhost:5000/api/auth/register', {
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
    const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
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
    const res = await fetch('http://localhost:5000/api/auth/login', {
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-auto">
        {view === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gold-dark mb-2 text-center">Login</h2>
            <input name="userid" placeholder="User ID" value={form.userid} onChange={handleChange} required className="px-4 py-2 rounded-lg border border-gray-200 focus:border-gold-dark" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="px-4 py-2 rounded-lg border border-gray-200 focus:border-gold-dark" />
            <button type="submit" className="bg-gold-dark text-white font-semibold py-2 rounded-lg hover:bg-gold transition">Login</button>
            <p className="text-center">Don't have an account? <a href="#" className="text-gold-dark hover:underline" onClick={() => setView('register')}>Register</a></p>
            {loading && <div className="flex justify-center"><div className="loader"></div></div>}
            {message && <div className="text-red-600 font-medium text-center">{message}</div>}
          </form>
        )}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gold-dark mb-2 text-center">Register</h2>
            <input name="userid" placeholder="User ID" value={form.userid} onChange={handleChange} required className="px-4 py-2 rounded-lg border border-gray-200 focus:border-gold-dark" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="px-4 py-2 rounded-lg border border-gray-200 focus:border-gold-dark" />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="px-4 py-2 rounded-lg border border-gray-200 focus:border-gold-dark" />
            <select name="region" value={form.region} onChange={handleChange} required className="px-4 py-2 rounded-lg border border-gray-200 focus:border-gold-dark">
              <option value="">Select Region</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Other">Other</option>
            </select>
            <button type="submit" className="bg-gold-dark text-white font-semibold py-2 rounded-lg hover:bg-gold transition">Register</button>
            <p className="text-center">Already have an account? <a href="#" className="text-gold-dark hover:underline" onClick={() => setView('login')}>Login</a></p>
            {loading && <div className="flex justify-center"><div className="loader"></div></div>}
            {message && <div className="text-red-600 font-medium text-center">{message}</div>}
          </form>
        )}
        {view === 'verify' && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gold-dark mb-2 text-center">Verify OTP</h2>
            <input name="otp" placeholder="Enter OTP" value={form.otp} onChange={handleChange} required className="px-4 py-2 rounded-lg border border-gray-200 focus:border-gold-dark" />
            <button type="submit" className="bg-gold-dark text-white font-semibold py-2 rounded-lg hover:bg-gold transition">Verify</button>
            {loading && <div className="flex justify-center"><div className="loader"></div></div>}
            {message && <div className="text-red-600 font-medium text-center">{message}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
