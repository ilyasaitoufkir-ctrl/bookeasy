import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Calendar, Settings, Users, LayoutDashboard, Search, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { signOut } from '../../services/firebase/auth';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface NavItem { label: string; to: string; icon: React.ReactNode }

const BUSINESS_NAV: NavItem[] = [
  { label: 'Dashboard',   to: '/dashboard',   icon: <LayoutDashboard size={18} /> },
  { label: 'Kalender',    to: '/dashboard/calendar',   icon: <Calendar size={18} /> },
  { label: 'Dienste',     to: '/dashboard/services',   icon: <BookOpen size={18} /> },
  { label: 'Mitarbeiter', to: '/dashboard/employees',  icon: <Users size={18} /> },
  { label: 'Einstellungen', to: '/dashboard/settings', icon: <Settings size={18} /> },
];

const CUSTOMER_NAV: NavItem[] = [
  { label: 'Suchen',       to: '/search',      icon: <Search size={18} /> },
  { label: 'Meine Termine', to: '/my-bookings', icon: <Calendar size={18} /> },
];

export function Header() {
  const { user, role } = useAuth();
  const { businessName, businessLogo, primaryColor } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = role === 'business' ? BUSINESS_NAV : CUSTOMER_NAV;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Abgemeldet');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? (role === 'business' ? '/dashboard' : '/search') : '/'} className="flex items-center gap-2 font-bold text-lg">
            {businessLogo
              ? <img src={businessLogo} alt={businessName} className="h-8 w-8 rounded-lg object-cover" />
              : <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                     style={{ backgroundColor: primaryColor }}>B</div>
            }
            <span className="text-navy-700">{businessName}</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {nav.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-medium text-xs">
                    {user.displayName?.[0]?.toUpperCase() || <User size={14} />}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden sm:flex">
                  <LogOut size={16} />
                  Abmelden
                </Button>
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button variant="ghost" size="sm">Anmelden</Button></Link>
                <Link to="/register"><Button size="sm">Kostenlos starten</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 animate-fade-in">
          {nav.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-navy-50 hover:text-navy-700"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 mt-2"
          >
            <LogOut size={18} /> Abmelden
          </button>
        </div>
      )}
    </header>
  );
}
