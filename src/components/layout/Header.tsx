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
  { label: 'Dashboard',     to: '/dashboard',            icon: <LayoutDashboard size={16} /> },
  { label: 'Kalender',      to: '/dashboard/calendar',   icon: <Calendar size={16} /> },
  { label: 'Dienste',       to: '/dashboard/services',   icon: <BookOpen size={16} /> },
  { label: 'Mitarbeiter',   to: '/dashboard/employees',  icon: <Users size={16} /> },
  { label: 'Einstellungen', to: '/dashboard/settings',   icon: <Settings size={16} /> },
];

const CUSTOMER_NAV: NavItem[] = [
  { label: 'Suchen',        to: '/search',       icon: <Search size={16} /> },
  { label: 'Meine Termine', to: '/my-bookings',  icon: <Calendar size={16} /> },
];

export function Header() {
  const { user, role } = useAuth();
  const { businessName, businessLogo, primaryColor } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = role === 'business' ? BUSINESS_NAV : CUSTOMER_NAV;
  const brand = primaryColor || '#c9a99a';

  const handleSignOut = async () => {
    await signOut();
    toast.success('Auf Wiedersehen!');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-cream-300/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to={user ? (role === 'business' ? '/dashboard' : '/search') : '/'}
            className="flex items-center gap-2.5 group"
          >
            {businessLogo
              ? <img src={businessLogo} alt={businessName} className="h-8 w-8 rounded-xl object-cover" />
              : <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-rose"
                  style={{ background: `linear-gradient(135deg, ${brand}, ${brand}cc)` }}
                >
                  {businessName?.[0] || 'B'}
                </div>
            }
            <span className="font-display font-semibold text-mauve-900 group-hover:text-rose-600 transition-colors">
              {businessName}
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-0.5">
              {nav.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm text-mauve-500 hover:bg-cream-200 hover:text-mauve-800 transition-all"
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
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 border border-cream-300">
                  <div className="h-6 w-6 rounded-full bg-rose-gradient flex items-center justify-center text-white text-xs font-semibold">
                    {user.displayName?.[0]?.toUpperCase() || <User size={12} />}
                  </div>
                  <span className="text-xs text-mauve-600 font-medium">{user.displayName?.split(' ')[0]}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden sm:flex text-mauve-400 hover:text-rose-600">
                  <LogOut size={14} />
                </Button>
                <button
                  className="md:hidden p-2 rounded-xl hover:bg-cream-200 text-mauve-600"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button variant="ghost" size="sm">Anmelden</Button></Link>
                <Link to="/register"><Button size="sm">Starten</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden bg-cream-50/95 backdrop-blur-sm border-t border-cream-300/60 px-4 py-3 space-y-1 animate-fade-in">
          {nav.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm text-mauve-600 hover:bg-cream-200 hover:text-mauve-900 transition-all"
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 rounded-2xl text-sm text-red-400 hover:bg-red-50 mt-2"
          >
            <LogOut size={16} /> Abmelden
          </button>
        </div>
      )}
    </header>
  );
}
