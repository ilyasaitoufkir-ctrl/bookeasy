import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getBusinessByOwner } from '../services/firebase/businesses';
import type { Business } from '../types';

export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getBusinessByOwner(user.uid)
      .then(setBusiness)
      .finally(() => setLoading(false));
  }, [user]);

  return { business, setBusiness, loading };
}
