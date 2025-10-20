import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Repair } from './interfaces';

export const useCreateRepairMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRepair: Omit<Repair, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('repairs')
        .insert(newRepair)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['repairsList'] });
      queryClient.invalidateQueries({ queryKey: ['recentRepairs'] });
    },
  });
};

export const useUpdateRepairMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedRepair: Partial<Repair> & { id: string }) => {
      const { data, error } = await supabase
        .from('repairs')
        .update(updatedRepair)
        .eq('id', updatedRepair.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['repairsList'] });
      queryClient.invalidateQueries({ queryKey: ['recentRepairs'] });
      if ((data as any)?.id) {
        queryClient.invalidateQueries({ queryKey: ['repairs', (data as any).id] });
        queryClient.invalidateQueries({ queryKey: ['repairs', 'details', (data as any).id] });
      }
    },
  });
};

export const useDeleteRepairMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('repairs').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['repairsList'] });
      queryClient.invalidateQueries({ queryKey: ['recentRepairs'] });
    },
  });
};