import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Offer } from './interfaces';

// Get all pending quotes for a given customer
export function useClientPendingOffers(clientId: string) {
  return useQuery<Offer[]>({
    queryKey: ['pending_offers', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          parts:offer_parts(*),
          services:offer_services(*)
        `)
        .eq('client_id', clientId)
        .eq('status', 'pending');

      if (error) throw error;
      return data as Offer[];
    },
  });
}

// Get all admin offers
export function useAdminOffers(adminId: string) {
  return useQuery<Offer[]>({
    queryKey: ['admin_offers', adminId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          parts:offer_parts(*),
          services:offer_services(*)
        `)
        .eq('admin_id', adminId);

      if (error) throw error;
      return data as Offer[];
    },
  });
}
