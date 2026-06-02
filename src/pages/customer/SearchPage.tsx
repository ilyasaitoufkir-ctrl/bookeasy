import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Tag, ChevronRight } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { searchBusinesses } from '../../services/firebase/businesses';
import { BUSINESS_CATEGORIES } from '../../types';
import type { Business } from '../../types';

export default function SearchPage() {
  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    searchBusinesses(query, category || undefined)
      .then(setBusinesses)
      .finally(() => setLoading(false));
  }, [query, category]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Search header */}
        <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-4">Termin buchen</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                leftIcon={<Search size={16} />}
                placeholder="Friseur, Kosmetik, Massage..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white focus:text-gray-900"
              />
            </div>
            <Select
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={[{ value: '', label: 'Alle Kategorien' }, ...BUSINESS_CATEGORIES.map(c => ({ value: c, label: c }))]}
              className="bg-white/10 border-white/20 text-white sm:w-48"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : businesses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Keine Einrichtungen gefunden</p>
            <p className="text-sm mt-1">Versuche eine andere Suche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map(b => (
              <Link key={b.id} to={`/${b.slug}`}>
                <Card hover>
                  <CardBody>
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: b.primaryColor }}
                      >
                        {b.logo ? <img src={b.logo} alt={b.name} className="h-full w-full object-cover" /> : b.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{b.name}</h3>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5">
                          <Tag size={10} /> {b.category}
                        </span>
                      </div>
                    </div>
                    {b.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{b.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={12} /> {b.city}
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-navy-700">
                        Buchen <ChevronRight size={12} />
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
