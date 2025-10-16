import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Client } from './interfaces';

export const useClientsQuery = () =>
  useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useClientQuery = (id: string) =>
  useQuery<Client>({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });