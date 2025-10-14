import { supabase } from "@/utils/supabaseClient";
import type { Vehicle } from "./interfaces";

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchVehiclesByClient = async (clientId: string): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchVehicleById = async (id: string): Promise<Vehicle | null> => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};
