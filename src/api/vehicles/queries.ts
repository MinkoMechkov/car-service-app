import { useQuery } from '@tanstack/vue-query';
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
  clientId: string,
  options?: { enabled?: ComputedRef<boolean> }
) =>
  useQuery<Vehicle[]>({
    queryKey: ['clientVehicles', clientId],
    queryFn: async () => {
      if (!clientId) return []; // Guard
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, client:clients!inner(id, name)')
        .eq('client.id', clientId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: options?.enabled ?? !!clientId,
  });
