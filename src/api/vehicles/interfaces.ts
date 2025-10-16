export interface Vehicle {
  id: string;
  client_id?: string | null;
  make: string;
  model: string;
  year?: number | null;
  license_plate: string;
  vin?: string | null;
  mileage?: number | null;
  created_at?: string | null;
}