import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from './components/SectionHeader';

interface Asset {
  id: number;
  type: string;
  weight: number;
  purchase_price: number;
  purchase_date: string;
  karat: string; // '24K' | '22K' | '18K'
}

interface DashboardData {
  invested: number;
  current: number;
  net: number;
  price24K?: number;
  price22K?: number;
  price18K?: number;
}

interface DashboardProps {
  token: string;
  onLogout: () => void;
  onInvalidToken?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'prices', label: 'Gold Prices' },
  { id: 'profit', label: 'Profit' },
  { id: 'graph', label: 'Graph' },
] as const;

type Section = (typeof NAV_ITEMS)[number]['id'];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function Dashboard({ token, onLogout, onInvalidToken }: DashboardProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [form, setForm] = useState({ type: '', weight: '', purchase_price: '', purchase_date: '', karat: '24K' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTitles] = useState(false);

  // --- Gold Price History ---
  interface GoldPriceHistoryItem {
    id: number;
    date: string;
    price_per_gram: { _24k: number; _22k: number; _18k: number };
  }

  const [history, setHistory] = useState<GoldPriceHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Helper to handle 401
  const handle401 = () => {
    localStorage.removeItem('token');
    if (onInvalidToken) onInvalidToken();
  };

  const fetchAssets = async () => {
    setLoading(true);
    const res = await fetch('https://api.gold-tracker.adarshsahu.site/api/gold/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return handle401();
    setAssets(await res.json());
    setLoading(false);
  };
  const fetchDashboard = async () => {
    setLoading(true);
    const res = await fetch('https://api.gold-tracker.adarshsahu.site/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return handle401();
    setDashboard(await res.json());
    setLoading(false);
  };
  const fetchGoldHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('https://api.gold-tracker.adarshsahu.site/api/gold/history?days=30');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    fetchAssets();
    fetchDashboard();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (section === 'prices') fetchGoldHistory();
    // eslint-disable-next-line
  }, [section]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    const res = await fetch('https://api.gold-tracker.adarshsahu.site/api/gold/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        weight: parseFloat(form.weight),
        total_price: parseFloat(form.purchase_price),
        purchase_date: form.purchase_date,
        karat: form.karat
      }),
    });
    if (res.status === 401) return handle401();
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setForm({ type: '', weight: '', purchase_price: '', purchase_date: '', karat: '24K' });
      fetchAssets();
      fetchDashboard();
      setToast('Gold asset added!');
      setTimeout(() => setToast(null), 2000);
    }
    setMsg(data.message || data.error);
  };

  const handleRemove = (id: number) => {
    setRemoveId(id);
    setShowModal(true);
  };

  const confirmRemove = async () => {
    if (removeId == null) return;
    setLoading(true);
    const res = await fetch(`https://api.gold-tracker.adarshsahu.site/api/gold/remove/${removeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return handle401();
    setShowModal(false);
    setRemoveId(null);
    fetchAssets();
    fetchDashboard();
    setLoading(false);
    setToast('Gold asset removed!');
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100">      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`btn transition-all duration-300 ${
                    section === item.id 
                      ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-dark-900 shadow-md' 
                      : 'bg-dark-100/50 text-dark-600 hover:bg-dark-200/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="hidden md:flex">
              <button className="btn btn-danger" onClick={onLogout}>
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center justify-between w-full">
              <div className="text-xl font-bold text-gold-600">Gold Tracker</div>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gold-600
                           hover:text-gold-700 hover:bg-gold-50 focus:outline-none"
                aria-label="Menu"
              >
                <svg
                  className={`${showMobileMenu ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${showMobileMenu ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-dark-100/10 bg-white/90 backdrop-blur-md"
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSection(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      section === item.id
                        ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-dark-900'
                        : 'text-dark-600 hover:bg-dark-100/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
          >
            {section === 'dashboard' && (
              <div className="space-y-8">
                {/* Add Asset Form */}
                <section className="card p-4 sm:p-6">
                  <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="md:col-span-2">
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                        className="input-field"
                      >
                        <option value="">Select Type</option>
                        <option value="Jewellery">Jewellery</option>
                        <option value="Coin">Coin</option>
                        <option value="Bar">Bar</option>
                      </select>
                    </div>
                    <input
                      name="weight"
                      type="number"
                      step="0.01"
                      placeholder="Weight (g)"
                      value={form.weight}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                    <input
                      name="purchase_price"
                      type="number"
                      step="0.01"
                      placeholder="Total Price (₹)"
                      value={form.purchase_price}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                    <input
                      name="purchase_date"
                      type="date"
                      value={form.purchase_date}
                      onChange={handleChange}
                      required
                      className="input-field md:col-span-2"
                    />
                    <select
                      name="karat"
                      value={form.karat}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="24K">24K</option>
                      <option value="22K">22K</option>
                      <option value="18K">18K</option>
                    </select>
                    <motion.button
                      type="submit"
                      className="btn btn-primary md:col-span-2"
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                    >
                      {loading ? <div className="loader" /> : 'Add Gold Asset'}
                    </motion.button>
                  </form>
                  {msg && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="mt-4 text-red-500 text-center"
                    >
                      {msg}
                    </motion.p>
                  )}
                </section>

                {/* Assets Table */}
                <section className="card overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-dark-100 flex justify-between items-center">
                    <SectionHeader 
                      title="Your Gold Assets"
                      showTitle={showTitles} 
                    />
                    {loading && <div className="loader" />}
                  </div>

                  {assets.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center text-dark-400">
                      No gold assets added yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {/* Desktop Table View */}
                      <table className="w-full hidden sm:table">
                        <thead className="bg-dark-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-dark-600 uppercase tracking-wider">Type</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-dark-600 uppercase tracking-wider">Weight (g)</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-dark-600 uppercase tracking-wider">Total Price (₹)</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-dark-600 uppercase tracking-wider">Price/g (₹)</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-dark-600 uppercase tracking-wider">Purchase Date</th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100">
                          {assets.map(asset => (
                            <motion.tr
                              key={asset.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-dark-50/50 transition-colors"
                            >
                              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-dark-900">{asset.type}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-dark-900">{asset.weight}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-dark-900">
                                ₹{(asset.weight * asset.purchase_price).toLocaleString()}
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-dark-900">
                                ₹{asset.purchase_price.toLocaleString()}
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-dark-900">
                                {asset.purchase_date.split('T')[0]}
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRemove(asset.id)}
                                  className="btn btn-danger text-sm"
                                >
                                  Remove
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Mobile Card View */}
                      <div className="sm:hidden divide-y divide-dark-100">
                        {assets.map(asset => (
                          <motion.div
                            key={asset.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-dark-900">{asset.type}</h3>
                                <p className="text-sm text-dark-600">{asset.purchase_date.split('T')[0]}</p>
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRemove(asset.id)}
                                className="btn btn-danger text-sm py-1 px-3"
                              >
                                Remove
                              </motion.button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-dark-600">Weight</p>
                                <p className="font-medium">{asset.weight}g</p>
                              </div>
                              <div>
                                <p className="text-dark-600">Price/g</p>
                                <p className="font-medium">₹{asset.purchase_price.toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-dark-600">Total Price</p>
                                <p className="font-medium">₹{(asset.weight * asset.purchase_price).toLocaleString()}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {section === 'prices' && (
              <section className="card p-4 sm:p-8">
                <SectionHeader 
                  title="Current Gold Prices"
                  className="mb-6 text-center"
                  showTitle={showTitles}
                />
                {dashboard ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                      { label: '24K Gold', value: dashboard.price24K },
                      { label: '22K Gold', value: dashboard.price22K },
                      { label: '18K Gold', value: dashboard.price18K }
                    ].map(({ label, value }) => (
                      <div key={label} className="card bg-gradient-to-br from-gold-50 to-white p-4 sm:p-6 text-center">
                        <h3 className="text-lg text-dark-600 mb-2">{label}</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-gold-600">
                          ₹{value ? value.toLocaleString() : '-'}
                          <span className="text-xs sm:text-sm text-dark-400 ml-1">per gram</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center py-8 sm:py-12">
                    <div className="loader" />
                  </div>
                )}

                <div className="mt-8">
                  <SectionHeader title="Gold Price History (Max per Day)" className="mb-4 text-center" showTitle={showTitles} />
                  {historyLoading ? (
                    <div className="flex justify-center py-8"><div className="loader" /></div>
                  ) : history.length === 0 ? (
                    <div className="text-center text-dark-400">No historical data available.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-2 py-2">Date</th>
                            <th className="px-2 py-2">24K (₹/g)</th>
                            <th className="px-2 py-2">22K (₹/g)</th>
                            <th className="px-2 py-2">18K (₹/g)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map(item => (
                            <tr key={item.id}>
                              <td className="px-2 py-2">{item.date.split('T')[0]}</td>
                              <td className="px-2 py-2">{item.price_per_gram?._24k?.toLocaleString() ?? '-'}</td>
                              <td className="px-2 py-2">{item.price_per_gram?._22k?.toLocaleString() ?? '-'}</td>
                              <td className="px-2 py-2">{item.price_per_gram?._18k?.toLocaleString() ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}

            {section === 'profit' && (
              <section className="card p-4 sm:p-8 text-center">
                <SectionHeader 
                  title="Net Profit"
                  className="mb-6"
                  showTitle={showTitles}
                />
                {dashboard ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="card bg-gradient-to-br from-gold-50 to-white p-6">
                      <h3 className="text-lg text-dark-600 mb-2">Invested</h3>
                      <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                        ₹{dashboard.invested ? dashboard.invested.toLocaleString() : '-'}
                      </p>
                    </div>
                    <div className="card bg-gradient-to-br from-gold-50 to-white p-6">
                      <h3 className="text-lg text-dark-600 mb-2">Current Value</h3>
                      <p className="text-3xl sm:text-4xl font-bold text-gold-600">
                        ₹{dashboard.current ? dashboard.current.toLocaleString() : '-'}
                      </p>
                    </div>
                    <div className="card bg-gradient-to-br from-gold-50 to-white p-6">
                      <h3 className="text-lg text-dark-600 mb-2">Profit</h3>
                      <p className={`text-3xl sm:text-4xl font-bold ${dashboard.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>₹{dashboard.net ? dashboard.net.toLocaleString() : '-'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-8 sm:py-12">
                    <div className="loader" />
                  </div>
                )}
              </section>
            )}

            {section === 'graph' && (
              <section className="card p-8 text-center">
                <SectionHeader 
                  title="Gold Price & Profit Graph"
                  className="mb-8"
                  showTitle={showTitles}
                />
                <div className="card bg-gradient-to-br from-gold-50 to-white p-12">
                  <p className="text-dark-400">(Interactive graph coming soon...)</p>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="card p-6 w-[400px] max-w-[90vw]">
                <h3 className="text-xl font-bold text-red-500 mb-4">Remove Asset?</h3>
                <p className="text-dark-600 mb-6">
                  Are you sure you want to remove this gold asset?
                </p>
                <div className="flex justify-end gap-4">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-danger"
                    onClick={confirmRemove}
                    disabled={loading}
                  >
                    {loading ? <div className="loader" /> : 'Remove'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="card bg-white/90 backdrop-blur px-6 py-3">
              <p className="text-dark-900">{toast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
