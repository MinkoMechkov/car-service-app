import { supabase } from "@/utils/supabaseClient";
import type { Repair } from "./interfaces";

// Fetch all repairs
export const fetchRepairs = async (): Promise<Repair[]> => {
  const { data, error } = await supabase
    .from("repairs")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
};

// Fetch repairs by vehicle
export const fetchRepairsByVehicle = async (vehicleId: string): Promise<Repair[]> => {
  const { data, error } = await supabase
    .from("repairs")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
};

// Fetch single repair
export const fetchRepairById = async (id: string): Promise<Repair | null> => {
  const { data, error } = await supabase.from("repairs").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};
