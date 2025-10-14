import { supabase } from "@/utils/supabaseClient";
import type { Vehicle } from "./interfaces";

export const insertVehicle = async (vehicle: Omit<Vehicle, "id" | "created_at">) => {
  const { data, error } = await supabase.from("vehicles").insert([vehicle]).select();
  if (error) throw error;
  return data?.[0];
};

export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
  const { data, error } = await supabase.from("vehicles").update(vehicle).eq("id", id).select();
  if (error) throw error;
  return data?.[0];
};

export const deleteVehicle = async (id: string) => {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
  return true;
};
