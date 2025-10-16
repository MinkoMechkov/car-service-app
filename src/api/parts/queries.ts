import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Part } from './interfaces';

export const usePartsQuery = () =>
  useQuery<Part[]>({
    queryKey: ['parts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('parts').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

export const usePartQuery = (id: string) =>
  useQuery<Part>({
    queryKey: ['parts', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('parts').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });