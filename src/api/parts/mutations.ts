import { supabase } from "@/utils/supabaseClient";
import type { Part } from "./interfaces";

// Insert new part
export const insertPart = async (part: Omit<Part, "id" | "created_at">) => {
  const { data, error } = await supabase.from("parts").insert([part]).select();
  if (error) throw error;
  return data?.[0];
};

// Update existing part
export const updatePart = async (id: string, part: Partial<Part>) => {
  const { data, error } = await supabase.from("parts").update(part).eq("id", id).select();
  if (error) throw error;
  return data?.[0];
};

// Delete part
export const deletePart = async (id: string) => {
  const { error } = await supabase.from("parts").delete().eq("id", id);
  if (error) throw error;
  return true;
};
