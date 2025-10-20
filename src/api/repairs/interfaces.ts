export type RepairPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RepairStatus = 'pending' | 'in_progress' | 'completed' | 'canceled';
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
  priority?: RepairPriority | null;
  status?: RepairStatus | null;
}

// Extended type used by details/list queries that join vehicle and client
export interface RepairWithRelations extends Repair {
  vehicle?: {
    make: string;
    model: string;
    license_plate: string;
    client?: {
      name: string;
    };
  };
}