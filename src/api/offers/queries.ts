import { useQuery } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import type { Offer } from "./interfaces";

export function useCurrentClientId() {
    return useQuery<string | null>({
        queryKey: ["current_client_id"],
        queryFn: async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from("clients")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (error || !data)
                throw new Error("No client found for current user");
            return data.id;
        },
        enabled: true,
    });
}

// Get all pending quotes for a given customer
export function useClientPendingOffers(userId?: string) {
    return useQuery<Offer[]>({
        queryKey: ["pending_offers", userId],
        queryFn: async () => {
            if (!userId) return [];

            const { data: clientData, error: clientError } = await supabase
                .from("clients")
                .select("id")
                .eq("user_id", userId)
                .single();

            if (clientError || !clientData)
                throw new Error("Client not found for user");

            const { data, error } = await supabase
                .from("offers")
                .select(
                    `
          *,
          parts:offer_parts(*),
          services:offer_services(*)
        `
                )
                .eq("client_id", clientData.id)
                .eq("status", "pending");

            if (error) throw error;

            return data as Offer[];
        },
        enabled: !!userId,
        staleTime: 0,
    });
}

// Get all admin offers
export function useAdminOffers(adminId: string) {
    return useQuery<Offer[]>({
        queryKey: ["admin_offers", adminId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("offers")
                .select(
                    `
          *,
          parts:offer_parts(*),
          services:offer_services(*)
        `
                )
                .eq("admin_id", adminId);

            if (error) throw error;
            return data as Offer[]; // Каст с partial client
        },
    });
}

// Get single offer with all relations for details view
export function useOfferDetails(offerId: string) {
    // Partial interface за select (само id, name за client)
    interface PartialClient {
        id: string;
        name: string;
    }

    // Intersection: Offer + partial joins
    type OfferWithRelations = Offer & {
        client?: PartialClient;
        admin?: {
            id: string;
            full_name: string;
        };
    };

    return useQuery<OfferWithRelations>({
        queryKey: ["offerDetails", offerId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("offers")
                .select(
                    `
          *,
          client:clients!offers_client_id_fkey (
            id,
            name
          ),
          admin:profiles!offers_admin_id_fkey (
            id,
            full_name
          ),
          parts:offer_parts(*),
          services:offer_services(*)
        `
                )
                .eq("id", offerId)
                .single();

            if (error) throw error;
            return data as OfferWithRelations;
        },
        enabled: !!offerId,
    });
}

// Get admin offers list with client relations for table view
export function useAdminOffersList(adminId: string) {
    // Partial interface за select (id, name, email за client – добавих id)
    interface PartialClient {
        id?: string; // Optional за гъвкавост
        name: string;
        email: string;
    }

    // Intersection: Offer + partial client
    type OfferWithClient = Offer & {
        client?: PartialClient;
    };

    return useQuery<OfferWithClient[]>({
        queryKey: ["admin_offers", adminId], // <-- Смени на това (sync с invalidate)
        queryFn: async () => {
            const { data, error } = await supabase
                .from("offers")
                .select(
                    `
            *,
            client:clients!offers_client_id_fkey (id, name, email),
            parts:offer_parts(*),
            services:offer_services(*)
          `
                )
                .eq("admin_id", adminId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return data as OfferWithClient[];
        },
        staleTime: 0, // За тест
    });
}

// Get parts catalog for form selection
export function usePartsCatalog() {
    return useQuery({
        queryKey: ["parts_catalog"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("parts")
                .select("id, name, brand, price");
            if (error) throw error;
            return data;
        },
    });
}

// Get services catalog for form selection
export function useServicesCatalog() {
    return useQuery({
        queryKey: ["services_catalog"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("services")
                .select("id, name, default_price");
            if (error) throw error;
            return data;
        },
    });
}
