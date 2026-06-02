import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBusinessBySlug } from '../../services/firebase/businesses';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import type { Business } from '../../types';
import KosmetikBooking from '../../components/templates/KosmetikBooking';
import FriseurBooking from '../../components/templates/FriseurBooking';
import MassageBooking from '../../components/templates/MassageBooking';

export default function BusinessPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getBusinessBySlug(slug).then(setBusiness).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-2xl bg-rose-gradient shadow-rose flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold font-serif">B</span>
          </div>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-serif text-xl text-mauve-700 mb-4">Studio nicht gefunden</p>
          <Button onClick={() => navigate('/search')}>Zur Suche</Button>
        </div>
      </div>
    );
  }

  if (business.isActive === false) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-5">🔒</div>
          <h2 className="font-serif text-xl font-semibold text-mauve-800 mb-2">{business.name}</h2>
          <p className="text-mauve-400 text-sm leading-relaxed">
            Dieses Studio nimmt momentan keine Online-Buchungen entgegen.
            {business.phone && <> Bitte rufen Sie uns an: <a href={`tel:${business.phone}`} className="text-rose-500 font-medium">{business.phone}</a></>}
          </p>
        </div>
      </div>
    );
  }

  switch (business.template) {
    case 'friseur':  return <FriseurBooking  business={business} />;
    case 'massage':  return <MassageBooking  business={business} />;
    case 'kosmetik':
    default:         return <KosmetikBooking business={business} />;
  }
}
