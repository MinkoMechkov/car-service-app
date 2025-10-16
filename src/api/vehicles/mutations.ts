import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Vehicle } from './interfaces';

export const useCreateVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newVehicle: Omit<Vehicle, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(newVehicle)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedVehicle: Partial<Vehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updatedVehicle)
        .eq('id', updatedVehicle.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteVehicleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};