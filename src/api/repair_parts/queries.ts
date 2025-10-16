import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { RepairPart } from './interfaces';

export const useRepairPartsQuery = () =>
  useQuery<RepairPart[]>({
    queryKey: ['repair_parts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('repair_parts').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useRepairPartQuery = (id: string) =>
  useQuery<RepairPart>({
    queryKey: ['repair_parts', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('repair_parts').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });