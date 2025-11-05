import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, type ComputedRef } from 'vue';
import { supabase } from '@/utils/supabaseClient';
import type { Vehicle } from './interfaces';

export interface VehicleWithClient extends Vehicle {
  client?: {
    name: string;
  } | null;
}

export const useVehicleQuery = (id?: string) =>
  useQuery<VehicleWithClient>({
    queryKey: ['vehicleDetails', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(
          `
        *,
        client:clients (name)
      `
        )
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

export const useVehiclesQuery = () =>
  useQuery<VehicleWithClient[]>({
    queryKey: ['vehiclesList'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(
          `
          *,
          client:clients (name)
        `
        )
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useClientVehiclesQuery = (
  clientId: string | Ref<string> | ComputedRef<string>,
  options?: { enabled?: ComputedRef<boolean> }
) => {
  const resolveId = () => (typeof clientId === 'string' ? clientId : clientId.value);
  return useQuery<Vehicle[]>({
    queryKey: ['clientVehicles', resolveId()],
    queryFn: async () => {
      const id = resolveId();
      if (!id) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, client:clients!inner(id, name)')
        .eq('client_id', id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: options?.enabled ?? (computed(() => !!resolveId()) as unknown as ComputedRef<boolean>),
  });
};
