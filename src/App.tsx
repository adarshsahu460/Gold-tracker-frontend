import { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import './App.css';

function Navbar({ token, onLogout }: { token: string | null, onLogout: () => void }) {
  return (
    <nav className="w-full bg-white shadow flex items-center justify-between px-6 py-3 fixed top-0 left-0 z-20">
      <span className="hidden md:block text-2xl font-bold text-gold-dark tracking-wide">Gold Tracker</span>
      <div className="flex gap-4 items-center">
        {token ? (
          <>
            <button className="bg-gold-dark text-white px-4 py-2 rounded-lg font-semibold hover:bg-gold transition" onClick={onLogout}>Logout</button>
          </>
        ) : null}
      </div>
    </nav>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleAuthSuccess = (tok: string) => {
    setToken(tok);
    localStorage.setItem('token', tok);
  };
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <Navbar token={token} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col pt-20 pb-8 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 w-full">
        {!token ? (
          <Auth onAuthSuccess={handleAuthSuccess} />
        ) : (
          <Dashboard token={token} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}

export default App;
