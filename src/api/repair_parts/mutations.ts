import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { RepairPart } from './interfaces';

export const useCreateRepairPartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRepairPart: Omit<RepairPart, 'id' | 'total_price'>) => {
      const { data, error } = await supabase
        .from('repair_parts')
        .insert(newRepairPart)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_parts'] });
    },
  });
};

export const useUpdateRepairPartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedRepairPart: Partial<RepairPart> & { id: string }) => {
      const { data, error } = await supabase
        .from('repair_parts')
        .update(updatedRepairPart)
        .eq('id', updatedRepairPart.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_parts'] });
    },
  });
};

export const useDeleteRepairPartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('repair_parts').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_parts'] });
    },
  });
};