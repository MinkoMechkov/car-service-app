export interface Repair {
  id: string;
  vehicle_id: string; // FK to vehicles.id
  service_id: string; // FK to services.id
  date: string;
  description?: string;
  total_cost?: number;
  mileage_at_service?: number;
  created_at?: string;
}
