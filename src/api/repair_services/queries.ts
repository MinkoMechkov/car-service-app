import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { RepairService } from './interfaces';

export const useRepairServicesQuery = () =>
  useQuery<RepairService[]>({
    queryKey: ['repair_services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('repair_services').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useRepairServiceQuery = (id: string) =>
  useQuery<RepairService>({
    queryKey: ['repair_services', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('repair_services').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });