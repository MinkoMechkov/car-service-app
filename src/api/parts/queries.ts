import { supabase } from "@/utils/supabaseClient";
import type { Part } from "./interfaces";

// Fetch all parts
export const fetchParts = async (): Promise<Part[]> => {
  const { data, error } = await supabase.from("parts").select("*").order("name");
  if (error) throw error;
  return data || [];
};

// Fetch parts by repair
export const fetchPartsByRepair = async (repairId: string): Promise<Part[]> => {
  const { data, error } = await supabase
    .from("parts")
    .select("*")
    .eq("repair_id", repairId);
  if (error) throw error;
  return data || [];
};
