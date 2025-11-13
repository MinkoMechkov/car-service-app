import { onMounted, onUnmounted, watch } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";

interface RealtimeBooking {
  id: string;
  client_id: string;
}

export function useBookingsRealtimeSync(
  userId?: string,
  role?: "admin" | "client",
  clientId?: string
) {
  const queryClient = useQueryClient();
  let channel: any = null;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    queryClient.invalidateQueries({ queryKey: ["availableTimeSlots"] });
    queryClient.invalidateQueries({ queryKey: ["bookingsCountByStatus"] });
  };

  const subscribe = () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }

    if (!userId || !role) return;

    const filter = role === "client" && clientId
      ? `client_id=eq.${clientId}`
      : undefined;

    channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter,
        },
        (payload: any) => {
          const booking = (payload.new || payload.old) as RealtimeBooking;
          if (!booking) return;

          if (role === "admin") {
            invalidateAll();
            return;
          }

          if (role === "client" && clientId && booking.client_id === clientId) {
            invalidateAll();
            return;
          }

          if (role === "client" && !clientId) {
            verifyAndRefresh(booking.id);
          }
        }
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime bookings subscribed");
        }
      });
  };

  const verifyAndRefresh = async (bookingId: string) => {
    if (role !== "client" || !userId) return;

    const { data } = await supabase
      .from("bookings")
      .select("client_id, clients!inner(user_id)")
      .eq("id", bookingId)
      .single();

    const client = data?.clients as unknown as { user_id: string } | null;

    if (client?.user_id === userId) {
      invalidateAll();
    }
  };

  watch(
    () => [userId, role, clientId],
    () => {
      if (userId && role) subscribe();
    },
    { immediate: true }
  );

  onMounted(() => {
    if (userId && role) subscribe();
  });

  onUnmounted(() => {
    if (channel) supabase.removeChannel(channel);
  });

  return { refetch: invalidateAll };
}