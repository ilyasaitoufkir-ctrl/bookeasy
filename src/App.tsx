import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import DashboardPage from './pages/business/DashboardPage';
import ServicesPage from './pages/business/ServicesPage';
import EmployeesPage from './pages/business/EmployeesPage';
import CalendarPage from './pages/business/CalendarPage';
import SettingsPage from './pages/business/SettingsPage';
import SearchPage from './pages/customer/SearchPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import BusinessPublicPage from './pages/public/BusinessPublicPage';

function PrivateRoute({ children, role: requiredRole }: { children: React.ReactNode; role?: 'business' | 'customer' }) {
  const { user, role, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'business' ? '/dashboard' : '/search'} replace />;
  }
  return <>{children}</>;
}

function RoleRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={role === 'business' ? '/dashboard' : '/search'} replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <RoleRedirect /> : <LandingPage />} />
      <Route path="/login" element={user ? <RoleRedirect /> : <LoginPage />} />
      <Route path="/register" element={user ? <RoleRedirect /> : <RegisterPage />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <PrivateRoute role="business"><OnboardingPage /></PrivateRoute>
      } />

      {/* Business routes */}
      <Route path="/dashboard" element={
        <PrivateRoute role="business"><DashboardPage /></PrivateRoute>
      } />
      <Route path="/dashboard/services" element={
        <PrivateRoute role="business"><ServicesPage /></PrivateRoute>
      } />
      <Route path="/dashboard/employees" element={
        <PrivateRoute role="business"><EmployeesPage /></PrivateRoute>
      } />
      <Route path="/dashboard/calendar" element={
        <PrivateRoute role="business"><CalendarPage /></PrivateRoute>
      } />
      <Route path="/dashboard/settings" element={
        <PrivateRoute role="business"><SettingsPage /></PrivateRoute>
      } />

      {/* Customer routes */}
      <Route path="/search" element={<SearchPage />} />
      <Route path="/my-bookings" element={
        <PrivateRoute role="customer"><MyBookingsPage /></PrivateRoute>
      } />

      {/* Public business pages (White Label) */}
      <Route path="/:slug" element={<BusinessPublicPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
