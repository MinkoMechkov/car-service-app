export interface Service {
  id: string;
  name: string; // e.g., "Oil Change"
  description?: string;
  labor_cost?: number;
  category?: string; // e.g., "Engine", "Suspension"
  created_at?: string;
}
