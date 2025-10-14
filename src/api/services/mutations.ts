import { supabase } from "@/utils/supabaseClient";
import type { Service } from "./interfaces";

// Insert new service
export const insertService = async (service: Omit<Service, "id" | "created_at">) => {
  const { data, error } = await supabase.from("services").insert([service]).select();
  if (error) throw error;
  return data?.[0];
};

// Update existing service
export const updateService = async (id: string, service: Partial<Service>) => {
  const { data, error } = await supabase.from("services").update(service).eq("id", id).select();
  if (error) throw error;
  return data?.[0];
};

// Delete service
export const deleteService = async (id: string) => {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
  return true;
};
