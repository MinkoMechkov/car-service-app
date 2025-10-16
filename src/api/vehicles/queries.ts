import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Vehicle } from './interfaces';

export const useVehiclesQuery = () =>
  useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useVehicleQuery = (id: string) =>
  useQuery<Vehicle>({
    queryKey: ['vehicles', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });