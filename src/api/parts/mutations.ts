import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Part } from './interfaces';

export const useCreatePartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPart: Omit<Part, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('parts')
        .insert(newPart)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
};

export const useUpdatePartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedPart: Partial<Part> & { id: string }) => {
      const { data, error } = await supabase
        .from('parts')
        .update(updatedPart)
        .eq('id', updatedPart.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
};

export const useDeletePartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('parts').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
    },
  });
};