import { useQuery } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import type { BookingWithDetails, BookingFilters, TimeSlot } from "./interfaces";
import { useGlobalState } from "@/composables/useGlobalState";
import type { Ref } from "vue";

/**
 * Get all bookings with optional filters
 */
export const useBookingsQuery = (filters?: Ref<BookingFilters | undefined>) => {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select(`
          *,
          client:clients!bookings_client_id_fkey (
            id,
            name,
            phone,
            email
          ),
          vehicle:vehicles!bookings_vehicle_id_fkey (
            id,
            make,
            model,
            license_plate
          ),
          service:services!bookings_service_id_fkey (
            id,
            name,
            default_price
          )
        `)
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      const filterValue = filters?.value;
      
      if (filterValue?.client_id) {
        query = query.eq("client_id", filterValue.client_id);
      }
      if (filterValue?.vehicle_id) {
        query = query.eq("vehicle_id", filterValue.vehicle_id);
      }
      if (filterValue?.status) {
        query = query.eq("status", filterValue.status);
      }
      if (filterValue?.date_from) {
        query = query.gte("booking_date", filterValue.date_from);
      }
      if (filterValue?.date_to) {
        query = query.lte("booking_date", filterValue.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BookingWithDetails[];
    },
  });
};

/**
 * Get booking by ID
 */
export const useBookingByIdQuery = (id: Ref<string | undefined>) => {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: async () => {
      if (!id.value) throw new Error("Booking ID is required");

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          client:clients!bookings_client_id_fkey (
            id,
            name,
            phone,
            email
          ),
          vehicle:vehicles!bookings_vehicle_id_fkey (
            id,
            make,
            model,
            license_plate
          ),
          service:services!bookings_service_id_fkey (
            id,
            name,
            default_price
          )
        `)
        .eq("id", id.value)
        .single();

      if (error) throw error;
      return data as BookingWithDetails;
    },
    enabled: () => !!id.value,
  });
};

/**
 * Get bookings for a specific date
 */
export const useBookingsByDateQuery = (date: Ref<string>) => {
  return useQuery({
    queryKey: ["bookings", "by-date", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          client:clients!bookings_client_id_fkey (
            id,
            name,
            phone,
            email
          ),
          vehicle:vehicles!bookings_vehicle_id_fkey (
            id,
            make,
            model,
            license_plate
          ),
          service:services!bookings_service_id_fkey (
            id,
            name,
            default_price
          )
        `)
        .eq("booking_date", date.value)
        .order("booking_time", { ascending: true });

      if (error) throw error;
      return data as BookingWithDetails[];
    },
  });
};

/**
 * Get available time slots for a specific date
 */
export const useAvailableTimeSlotsQuery = (
  date: Ref<string>,
  options?: {
    workingHoursStart?: number;
    workingHoursEnd?: number;
    slotDuration?: number;
  }
) => {
  const workingHoursStart = options?.workingHoursStart ?? 8;
  const workingHoursEnd = options?.workingHoursEnd ?? 18;

  return useQuery({
    queryKey: ["bookings", "time-slots", date, options],
    queryFn: async () => {
      // First, get all bookings for the date
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
          *,
          client:clients!bookings_client_id_fkey (
            id,
            name,
            phone,
            email
          ),
          vehicle:vehicles!bookings_vehicle_id_fkey (
            id,
            make,
            model,
            license_plate
          ),
          service:services!bookings_service_id_fkey (
            id,
            name,
            default_price
          )
        `)
        .eq("booking_date", date.value)
        .order("booking_time", { ascending: true });

      if (error) throw error;

      const slots: TimeSlot[] = [];

      for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
        const time = `${hour.toString().padStart(2, "0")}:00:00`;
        const existingBooking = (bookings as BookingWithDetails[]).find(
          (b) =>
            b.booking_time.substring(0, 5) === time.substring(0, 5) &&
            b.status !== "cancelled"
        );

        slots.push({
          time,
          available: !existingBooking,
          booking: existingBooking,
        });
      }

      return slots;
    },
  });
};

/**
 * Get bookings for current user (client view)
 */
export const useMyBookingsQuery = () => {
  const { user } = useGlobalState();

  return useQuery({
    queryKey: ["bookings", "my-bookings", user],
    queryFn: async () => {
      if (!user.value) throw new Error("Not authenticated");

      // First get the client ID for the current user
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.value.id)
        .single();

      if (clientError) throw clientError;

      // Then get bookings for that client
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          client:clients!bookings_client_id_fkey (
            id,
            name,
            phone,
            email
          ),
          vehicle:vehicles!bookings_vehicle_id_fkey (
            id,
            make,
            model,
            license_plate
          ),
          service:services!bookings_service_id_fkey (
            id,
            name,
            default_price
          )
        `)
        .eq("client_id", client.id)
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (error) throw error;
      return data as BookingWithDetails[];
    },
    enabled: () => !!user.value,
  });
};

/**
 * Get pending bookings (admin view)
 */
export const usePendingBookingsQuery = () => {
  return useQuery({
    queryKey: ["bookings", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          client:clients!bookings_client_id_fkey (
            id,
            name,
            phone,
            email
          ),
          vehicle:vehicles!bookings_vehicle_id_fkey (
            id,
            make,
            model,
            license_plate
          ),
          service:services!bookings_service_id_fkey (
            id,
            name,
            default_price
          )
        `)
        .eq("status", "pending")
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (error) throw error;
      return data as BookingWithDetails[];
    },
  });
};

/**
 * Get bookings count by status
 */
export const useBookingsCountByStatusQuery = () => {
  return useQuery({
    queryKey: ["bookings", "count-by-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("status");

      if (error) throw error;

      const counts: Record<string, number> = {
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
      };

      data.forEach((booking) => {
        counts[booking.status]++;
      });

      return counts;
    },
  });
};