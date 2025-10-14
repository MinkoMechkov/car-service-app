import { supabase } from "@/utils/supabaseClient";
import type { Service } from "./interfaces";

// Fetch all services
export const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase.from("services").select("*").order("name");
  if (error) throw error;
  return data || [];
};

// Fetch service by ID
export const fetchServiceById = async (id: string): Promise<Service | null> => {
  const { data, error } = await supabase.from("services").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};
