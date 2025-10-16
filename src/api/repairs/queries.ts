import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Repair } from './interfaces';

export const useRepairsQuery = () =>
  useQuery<Repair[]>({
    queryKey: ['repairs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('repairs').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useRepairQuery = (id: string) =>
  useQuery<Repair>({
    queryKey: ['repairs', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('repairs').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });