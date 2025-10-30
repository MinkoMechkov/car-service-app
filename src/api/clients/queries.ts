import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import type { Client } from './interfaces';

export const useClientsQuery = () =>
  useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useClientQuery = (id: string) =>
  useQuery<Client | null>({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

export const useUnregisteredClientsQuery = () =>
  useQuery<Array<{ id: string; full_name?: string | null; email?: string | null }>>({
    queryKey: ['unregisteredClients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('unregistered_clients_view').select('*'); // Flat: id, full_name, email
      if (error) throw error;
      return data ?? [];
    },
    enabled: true,
  });

export const useCurrentClientQuery = (currentUserId: Ref<string | null>, isAdmin: Ref<boolean>) =>
  useQuery<{ id: string } | null>({
    queryKey: ['currentClient', currentUserId],
    queryFn: async () => {
      if (!currentUserId.value || isAdmin.value) return null;
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', currentUserId.value)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!currentUserId.value && !isAdmin.value,
  });
