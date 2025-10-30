import { useQuery } from '@tanstack/vue-query';
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
  clientId: string,
  options?: { enabled?: ComputedRef<boolean> }
) =>
  useQuery<Repair[]>({
    queryKey: ['clientRepairs', clientId],
    queryFn: async () => {
      if (!clientId) return []; // Guard: Return empty array for invalid clientId
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
        .eq('vehicle.client.id', clientId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: options?.enabled ?? !!clientId,
  });

export const useClientRecentRepairsQuery = (
  clientId: string,
  options?: { enabled?: ComputedRef<boolean> }
) =>
  useQuery<RecentRepair[]>({
    queryKey: ['clientRecentRepairs', clientId],
    queryFn: async () => {
      if (!clientId) return []; // Guard against empty clientId (prevents UUID error)
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
        .eq('vehicle.client.id', clientId) // Filter by client
        .order('date', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data ?? [];
    },
    enabled: options?.enabled ?? !!clientId,
  });
