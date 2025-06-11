import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-gradient-to-r from-amber-500 to-yellow-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white">Gold Tracker</span>
          </div>
          <div className="flex space-x-8">
            {['Dashboard', 'Gold Prices', 'Analytics'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(' ', '-')}`}
                className={`inline-flex items-center px-3 py-2 text-white hover:text-yellow-200 transition-colors
                  ${location.pathname === `/${item.toLowerCase().replace(' ', '-')}` 
                    ? 'border-b-2 border-white' 
                    : ''
                  }`}
              >
                {item}
              </Link>
            ))}
            <button 
              onClick={() => localStorage.removeItem('token')}
              className="px-4 py-2 text-yellow-600 bg-white rounded-lg hover:bg-yellow-50 
                transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;