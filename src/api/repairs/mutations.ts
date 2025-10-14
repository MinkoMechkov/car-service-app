import { supabase } from "@/utils/supabaseClient";
import type { Repair } from "./interfaces";

// Insert new repair
export const insertRepair = async (repair: Omit<Repair, "id" | "created_at">) => {
  const { data, error } = await supabase.from("repairs").insert([repair]).select();
  if (error) throw error;
  return data?.[0];
};

// Update repair
export const updateRepair = async (id: string, repair: Partial<Repair>) => {
  const { data, error } = await supabase.from("repairs").update(repair).eq("id", id).select();
  if (error) throw error;
  return data?.[0];
};

// Delete repair
export const deleteRepair = async (id: string) => {
  const { error } = await supabase.from("repairs").delete().eq("id", id);
  if (error) throw error;
  return true;
};
