export interface Vehicle {
  id: string;
  client_id: string; 
  make: string;
  model: string;
  year?: number;
  license_plate?: string;
  mileage?: number;
  created_at?: string;
}
