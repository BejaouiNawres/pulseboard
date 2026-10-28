import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-white font-bold text-xl">
            📊 PulseBoard
          </Link>
          <Link to="/dashboard" className="text-slate-300 hover:text-white text-sm">
            Dashboard
          </Link>
          <Link to="/alerts" className="text-slate-300 hover:text-white text-sm">
            Alerts
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{user?.name}</span>
          <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">
            {user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
