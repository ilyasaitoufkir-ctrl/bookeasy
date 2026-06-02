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

  switch (business.template) {
    case 'friseur':  return <FriseurBooking  business={business} />;
    case 'massage':  return <MassageBooking  business={business} />;
    case 'kosmetik':
    default:         return <KosmetikBooking business={business} />;
  }
}
