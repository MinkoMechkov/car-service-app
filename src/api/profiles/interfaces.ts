export interface Profile {
  id: string;
  full_name: string | null;
  role: "admin" | "client";
  created_at?: string | null;
}
