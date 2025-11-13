import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import type { Booking, CreateBookingDto, UpdateBookingDto } from "./interfaces";
import { useGlobalState } from "@/composables/useGlobalState";

/**
 * Create a new booking
 */
export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useGlobalState();

  return useMutation({
    mutationFn: async (dto: CreateBookingDto) => {
      if (!user.value) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.value.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const bookingData = {
        ...dto,
        duration_minutes: dto.duration_minutes || 60,
        created_by: profile.id,
        status: "pending" as const,
      };

      const { data, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

/**
 * Update a booking
 */
export const useUpdateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBookingDto;
    }) => {
      const { data: result, error } = await supabase
        .from("bookings")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!result) {
        throw new Error("No rows updated. Check record ID or permissions.");
      }
      return result as Booking;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: ["bookings", variables.id],
        });
      }
    },
  });
};

/**
 * Approve a booking (admin only)
 */
export const useApproveBookingMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useGlobalState();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user.value) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.value.id)
        .single();

      if (!profile || profile.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const { data, error } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          approved_by: profile.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error("No rows updated. Check record ID or permissions.");
      }
      return data as Booking;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
    },
  });
};

/**
 * Cancel a booking
 */
export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error("No rows updated. Check record ID or permissions.");
      }
      return data as Booking;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
    },
  });
};

/**
 * Complete a booking (admin only)
 */
export const useCompleteBookingMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useGlobalState();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user.value) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.value.id)
        .single();

      if (!profile || profile.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error("No rows updated. Check record ID or permissions.");
      }
      return data as Booking;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
    },
  });
};

/**
 * Delete a booking
 */
export const useDeleteBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

/**
 * Reschedule a booking
 */
export const useRescheduleBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newDate,
      newTime,
    }: {
      id: string;
      newDate: string;
      newTime: string;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({
          booking_date: newDate,
          booking_time: newTime,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error("No rows updated. Check record ID or permissions.");
      }
      return data as Booking;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: ["bookings", variables.id],
        });
      }
    },
  });
};