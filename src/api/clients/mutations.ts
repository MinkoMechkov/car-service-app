import { supabase } from "@/utils/supabaseClient";
import type { Client } from "./interfaces";

// ✅ Insert new client
export const insertClient = async (client: Omit<Client, "id" | "created_at">) => {
  const { data, error } = await supabase.from("clients").insert([client]).select();
  if (error) throw error;
  return data?.[0];
};

// ✅ Update existing client
export const updateClient = async (id: string, client: Partial<Client>) => {
  const { data, error } = await supabase.from("clients").update(client).eq("id", id).select();
  if (error) throw error;
  return data?.[0];
};

// ✅ Delete client
export const deleteClient = async (id: string) => {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
  return true;
};
