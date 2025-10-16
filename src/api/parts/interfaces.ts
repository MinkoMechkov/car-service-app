export interface Part {
  id: string;
  name: string;
  brand?: string | null;
  oem_code?: string | null;
  price?: number | null;
  created_at?: string | null;
}