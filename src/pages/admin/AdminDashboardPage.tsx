import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBusinesses, updateBusiness } from '../../services/firebase/businesses';
import type { Business } from '../../types';
import { TEMPLATES } from '../../config/templates';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      navigate('/admin');
      return;
    }
    getAllBusinesses().then(data => {
      setBusinesses(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });
  }, [navigate]);

  async function toggleActive(business: Business) {
    const updated = { ...business, isActive: !business.isActive };
    setBusinesses(prev => prev.map(b => b.id === business.id ? updated : b));
    await updateBusiness(business.id, { isActive: !business.isActive });
  }

  function logout() {
    sessionStorage.removeItem('admin_auth');
    navigate('/admin');
  }

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <LoadingSpinner size="lg" className="text-gold-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="border-b border-dark-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gold-gradient flex items-center justify-center">
            <span className="text-dark-900 font-bold text-sm font-serif">B</span>
          </div>
          <div>
            <h1 className="font-bold text-white font-serif">BookEasy Admin</h1>
            <p className="text-dark-400 text-xs">{businesses.length} Businesses</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/create')}
            className="bg-gold-gradient text-dark-900 font-semibold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition"
          >
            + Neues Business
          </button>
          <button
            onClick={logout}
            className="text-dark-400 hover:text-white px-4 py-2 rounded-xl text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {businesses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🏢</p>
            <h3 className="text-white font-semibold text-lg mb-2">Noch keine Businesses</h3>
            <p className="text-dark-400 text-sm mb-6">Erstelle dein erstes Business mit dem Template-Baukasten</p>
            <button
              onClick={() => navigate('/admin/create')}
              className="bg-gold-gradient text-dark-900 font-semibold px-6 py-3 rounded-2xl hover:opacity-90 transition"
            >
              Erstes Business erstellen
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {businesses.map(business => {
              const template = business.template ? TEMPLATES[business.template] : TEMPLATES.kosmetik;
              return (
                <div
                  key={business.id}
                  className="bg-dark-700 rounded-2xl border border-dark-600 p-5 flex items-center gap-4 hover:border-dark-500 transition"
                >
                  {/* Template badge */}
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: template.previewGradient }}
                  >
                    {template.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{business.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          business.isActive !== false
                            ? 'bg-green-900 text-green-300'
                            : 'bg-dark-600 text-dark-300'
                        }`}
                      >
                        {business.isActive !== false ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm truncate">
                      {template.name} · {business.city} · bookeasy.app/{business.slug}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`/${business.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark-400 hover:text-gold-400 px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      Vorschau ↗
                    </a>
                    <button
                      onClick={() => navigate(`/admin/edit/${business.id}`)}
                      className="text-dark-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => toggleActive(business)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        business.isActive !== false
                          ? 'bg-dark-600 text-dark-300 hover:bg-red-900 hover:text-red-300'
                          : 'bg-dark-600 text-dark-300 hover:bg-green-900 hover:text-green-300'
                      }`}
                    >
                      {business.isActive !== false ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
