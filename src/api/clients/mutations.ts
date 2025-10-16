import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Client } from './interfaces';

export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newClient: Omit<Client, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(newClient)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedClient: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updatedClient)
        .eq('id', updatedClient.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};