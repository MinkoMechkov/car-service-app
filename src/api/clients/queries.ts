import { supabase } from "@/utils/supabaseClient";
import type { Client } from "./interfaces";

// ✅ Fetch all clients
export const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// ✅ Fetch single client by ID
export const fetchClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};
