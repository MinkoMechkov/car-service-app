export interface RepairPart {
  id: string;
  repair_id?: string | null;
  part_id?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  total_price?: number | null;
}