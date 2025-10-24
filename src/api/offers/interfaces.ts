export interface OfferPart {
  id: string;
  offer_id: string;
  part_id?: string | null;
  name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface OfferService {
  id: string;
  offer_id: string;
  service_id?: string | null;
  name: string;
  price: number;
  created_at: string;
}

export interface Offer {
  id: string;
  admin_id: string;
  client_id: string;
  title: string;
  description?: string;
  labor_cost: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  parts?: OfferPart[];
  services?: OfferService[];
}
