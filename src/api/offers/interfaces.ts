export interface OfferClient {
    id: string;
    name: string;
    email: string;
}

export interface OfferPart {
    id: string;
    offer_id: string;
    part_id: string;
    name: string;
    quantity: number;
    price: number;
    created_at: string;
}

export interface OfferService {
    id: string;
    offer_id: string;
    service_id: string;
    name: string;
    price: number;
    created_at: string;
}
export interface CatalogPart {
    id: string;
    name: string;
    brand: string;
    price: number;
}

export interface CatalogService {
    id: string;
    name: string;
    default_price: number;
}

// --- Offer with admin relation (used in admin dashboard)
export interface OfferWithRelations extends Offer {
    admin: {
        id: string;
        full_name: string;
    };
}
export interface Offer {
    id: string;
    admin_id: string;
    client_id: string;
    client?: Partial<OfferClient>;
    title: string;
    description?: string;
    labor_cost: number;
    total_amount: number;
    status: "pending" | "accepted" | "declined";
    created_at: string;
    updated_at: string;
    repair_id?: string | null;

    // Relations
    parts?: OfferPart[];
    services?: OfferService[];
}
