export interface Repair {
  id: string;
  vehicle_id?: string | null;
  date?: string | null;
  description?: string | null;
  total_cost?: number | null;
  mileage_at_service?: number | null;
  next_service_km?: number | null;
  next_service_date?: string | null;
  created_at?: string | null;
  priority?: string | null;
}