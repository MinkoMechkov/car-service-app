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

// Get single offer with all relations for details view
export function useOfferDetails(offerId: string) {
  interface OfferWithRelations extends Offer {
    client?: {
      id: string;
      name: string;
    };
    admin?: {
      id: string;
      full_name: string;
    };
  }

  return useQuery<OfferWithRelations>({
    queryKey: ['offerDetails', offerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          client:clients!offers_client_id_fkey (
            id,
            name
          ),
          admin:profiles!offers_admin_id_fkey (
            id,
            full_name
          ),
          parts:offer_parts(*),
          services:offer_services(*)
        `)
        .eq('id', offerId)
        .single();

      if (error) throw error;
      return data as OfferWithRelations;
    },
    enabled: !!offerId,
  });
}

// Get admin offers list with client relations for table view
export function useAdminOffersList(adminId: string) {
  interface OfferWithClient extends Offer {
    client?: {
      name: string;
      email: string;
    };
  }

  return useQuery<OfferWithClient[]>({
    queryKey: ['adminOffersList', adminId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          client:clients!offers_client_id_fkey (
            id,
            name,
            email
          ),
          parts:offer_parts(*),
          services:offer_services(*)
        `)
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OfferWithClient[];
    },
  });
}

// Get parts catalog for form selection
export function usePartsCatalog() {
  return useQuery({
    queryKey: ['parts_catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts')
        .select('id, name, brand, price');
      if (error) throw error;
      return data;
    },
  });
}

// Get services catalog for form selection
export function useServicesCatalog() {
  return useQuery({
    queryKey: ['services_catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, default_price');
      if (error) throw error;
      return data;
    },
  });
}
