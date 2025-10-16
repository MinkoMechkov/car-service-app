import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { RepairService } from './interfaces';

export const useCreateRepairServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRepairService: Omit<RepairService, 'id'>) => {
      const { data, error } = await supabase
        .from('repair_services')
        .insert(newRepairService)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_services'] });
    },
  });
};

export const useUpdateRepairServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedRepairService: Partial<RepairService> & { id: string }) => {
      const { data, error } = await supabase
        .from('repair_services')
        .update(updatedRepairService)
        .eq('id', updatedRepairService.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_services'] });
    },
  });
};

export const useDeleteRepairServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('repair_services').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_services'] });
    },
  });
};