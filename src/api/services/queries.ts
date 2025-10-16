import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Service } from './interfaces';

export const useServicesQuery = () =>
  useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useServiceQuery = (id: string) =>
  useQuery<Service>({
    queryKey: ['services', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });