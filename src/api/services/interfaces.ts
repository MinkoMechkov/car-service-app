export interface Service {
  id: string;
  name: string;
  default_price?: number | null;
  description?: string | null;
  created_at?: string | null;
}