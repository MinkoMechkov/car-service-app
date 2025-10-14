export interface Part {
  id: string;
  repair_id?: string; // optional FK to repairs.id
  name: string;
  brand?: string;
  price?: number;
  quantity?: number;
  is_custom?: boolean;
  created_at?: string;
}
