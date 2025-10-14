export interface Client {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  created_at?: string;
}
