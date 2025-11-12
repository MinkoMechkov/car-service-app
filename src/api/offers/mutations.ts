import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Offer } from './interfaces';
import { message } from 'ant-design-vue';

// Create new offer
export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offer: Partial<Offer>) => {
      const { data, error } = await supabase.from('offers').insert(offer).select().single();

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
    mutationFn: async ({
      offerId,
      response,
    }: {
      offerId: string;
      response: 'accepted' | 'declined';
    }) => {
      const { error } = await supabase
        .from('offers')
        .update({ status: response })
        .eq('id', offerId);
      if (error) throw error;
      return offerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_offers'] });
      queryClient.invalidateQueries({ queryKey: ['admin_offers'] });
    },
  });
}

// Update existing offer
export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      offerData,
      parts,
      services,
    }: {
      offerId: string;
      offerData: Partial<Offer>;
      parts?: Array<{
        name: string;
        part_id?: string;
        quantity: number;
        price: number;
      }>;
      services?: Array<{
        name: string;
        service_id?: string;
        price: number;
      }>;
    }) => {
      // Update the main offer with updated_at timestamp
      const { data: updatedOffer, error: offerError } = await supabase
        .from('offers')
        .update({
          ...offerData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select()
        .single();

      if (offerError) throw offerError;

      // Update offer parts if provided
      if (parts) {
        // Delete existing parts
        const { error: deletePartsError } = await supabase
          .from('offer_parts')
          .delete()
          .eq('offer_id', offerId);

        if (deletePartsError) throw deletePartsError;

        // Insert new parts
        if (parts.length > 0) {
          const { error: insertPartsError } = await supabase.from('offer_parts').insert(
            parts.map((part) => ({
              offer_id: offerId,
              part_id: part.part_id,
              name: part.name,
              quantity: part.quantity,
              price: part.price,
            }))
          );
          if (insertPartsError) throw insertPartsError;
        }
      }

      // Update offer services if provided
      if (services) {
        // Delete existing services
        const { error: deleteServicesError } = await supabase
          .from('offer_services')
          .delete()
          .eq('offer_id', offerId);

        if (deleteServicesError) throw deleteServicesError;

        // Insert new services
        if (services.length > 0) {
          const { error: insertServicesError } = await supabase.from('offer_services').insert(
            services.map((service) => ({
              offer_id: offerId,
              service_id: service.service_id,
              name: service.name,
              price: service.price,
            }))
          );
          if (insertServicesError) throw insertServicesError;
        }
      }

      return updatedOffer as Offer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin_offers'] });
      queryClient.invalidateQueries({ queryKey: ['pending_offers'] });
      queryClient.invalidateQueries({
        queryKey: ['offerDetails', variables.offerId],
      });
    },
  });
}

export const useCreateRepairFromOfferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const { data, error } = await supabase.rpc('create_repair_from_offer', { offer_id: offerId });
      if (error) throw error;
      return data;
    },
    onSuccess: (repairId, offerId) => {
      message.success('Repair created successfully');
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offerDetails', offerId] });
      return repairId;
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create repair');
    },
  });
};
