import { onMounted, onUnmounted } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import type { Offer } from "@/api/offers/interfaces";

export function useOffersRealtimeSync(userId?: string, role?: string) {
    const queryClient = useQueryClient();

    let channel: any;

    onMounted(() => {
        if (!userId || !role) {
            console.warn(
                "⚠️ useOffersRealtimeSync: Missing userId or role – skipping realtime sync"
            );
            return;
        }

        channel = supabase
            .channel("offers-realtime")
            .on<Offer>(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "offers",
                },
                async (payload) => {
                    const record = (payload.new || payload.old) as Offer;
                    const isUpdate = payload.eventType === "UPDATE";

                    if (role === "admin") {
                        queryClient.invalidateQueries({
                            queryKey: ["admin_offers"],
                        });
                        return;
                    }

                    if (role === "client") {
                        if (isUpdate) {
                            queryClient.invalidateQueries({
                                queryKey: ["pending_offers", userId],
                            });
                            return;
                        }

                        const { data: clientData, error } = await supabase
                            .from("clients")
                            .select("user_id")
                            .eq("id", record.client_id)
                            .single();

                        if (error || !clientData) {
                            console.warn(
                                "🚫 Client query failed for offer:",
                                record.id,
                                { error: error?.message, clientData }
                            );
                            return;
                        }

                        const offerOwnerUserId = clientData.user_id;

                        if (offerOwnerUserId !== userId) {
                            return;
                        }

                        queryClient.invalidateQueries({
                            queryKey: ["pending_offers", userId],
                        });
                    }
                }
            )
            .subscribe();
    });

    onUnmounted(() => {
        if (channel) {
            supabase.removeChannel(channel);
        }
    });
}
