import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Offer } from './interfaces';

// Create new offer
export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offer: Partial<Offer>) => {
      const { data, error } = await supabase
        .from('offers')
        .insert(offer)
        .select()
        .single();

      if (error) throw error;
      return data as Offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_offers'] });
    },
  });
}

// Customer responds to an offer (accept/decline)
export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, response }: { offerId: string; response: 'accepted' | 'declined' }) => {
      const { error } = await supabase
        .from('offers')
        .update({ status: response })
        .eq('id', offerId);
      if (error) throw error;
      return offerId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending_offers', variables.offerId] });
    },
  });
}
