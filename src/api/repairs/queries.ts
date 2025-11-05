import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, type ComputedRef } from 'vue';
import { supabase } from '@/utils/supabaseClient';
import type { Repair, RepairWithRelations, RecentRepair } from './interfaces';

export const useRepairsQuery = () =>
  useQuery<Repair[]>({
    queryKey: ['repairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('repairs')
        .select(
          `
          *,
          vehicle:vehicles (
            id,
            make,
            model,
            license_plate,
            year,
            client:clients ( id, name )
          )
        `
        )
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

export const useRepairQuery = (id: string) =>
  useQuery<Repair>({
    queryKey: ['repairs', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('repairs').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

export const useRepairDetailsQuery = (id: string) =>
  useQuery<RepairWithRelations>({
    queryKey: ['repairs', 'details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('repairs')
        .select(
          `
          *,
          vehicle:vehicles (
            make,
            model,
            license_plate,
            client:clients (name)
          )
        `
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as RepairWithRelations;
    },
    enabled: !!id,
  });

export const useRecentRepairsQuery = () =>
  useQuery<RecentRepair[]>({
    queryKey: ['recentRepairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('repairs')
        .select(
          `
          *,
          vehicle:vehicles (
            make,
            model,
            license_plate,
            client:clients (name)
          )
        `
        )
        .order('date', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data ?? [];
    },
  });

export const useClientRepairsQuery = (
  clientId: string | Ref<string> | ComputedRef<string>,
  options?: { enabled?: ComputedRef<boolean> }
) => {
  const resolveId = () => (typeof clientId === 'string' ? clientId : clientId.value);
  return useQuery<Repair[]>({
    queryKey: ['clientRepairs', resolveId()],
    queryFn: async () => {
      const id = resolveId();
      if (!id) return [];
      const { data, error } = await supabase
        .from('repairs')
        .select(
          `
          *,
          vehicle:vehicles!inner (
            *,
            client:clients!inner (id, name)
          )
        `
        )
        .eq('vehicle.client_id', id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: options?.enabled ?? (computed(() => !!resolveId()) as unknown as ComputedRef<boolean>),
  });
};

export const useClientRecentRepairsQuery = (
  clientId: string | Ref<string> | ComputedRef<string>,
  options?: { enabled?: ComputedRef<boolean> }
) => {
  const resolveId = () => (typeof clientId === 'string' ? clientId : clientId.value);
  return useQuery<RecentRepair[]>({
    queryKey: ['clientRecentRepairs', resolveId()],
    queryFn: async () => {
      const id = resolveId();
      if (!id) return [];
      const { data, error } = await supabase
        .from('repairs')
        .select(
          `
          *,
          vehicle:vehicles (
            make,
            model,
            license_plate,
            client:clients (name)
          )
        `
        )
        .eq('vehicle.client_id', id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data ?? [];
    },
    enabled: options?.enabled ?? (computed(() => !!resolveId()) as unknown as ComputedRef<boolean>),
  });
};
