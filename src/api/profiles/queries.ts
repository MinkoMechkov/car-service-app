import { useQuery } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import type { Profile } from "./interfaces";

/**
 * Get all profiles (admin only)
 */
export const useProfilesQuery = () =>
  useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

/**
 * Get the profile of the currently logged-in user
 */
export const useCurrentProfileQuery = () =>
  useQuery<Profile | null>({
    queryKey: ["profile", "current"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

/**
 * Get a specific profile by ID (admin use)
 */
export const useProfileQuery = (id: string) =>
  useQuery<Profile | null>({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
