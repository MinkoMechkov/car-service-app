export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  client_id: string;
  vehicle_id: string;
  service_id: string | null;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:mm:ss
  duration_minutes: number;
  status: BookingStatus;
  notes: string | null;
  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  client: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    license_plate: string;
  };
  service: {
    id: string;
    name: string;
    default_price: number | null;
  } | null;
}

export interface CreateBookingDto {
  client_id: string;
  vehicle_id: string;
  service_id?: string | null;
  booking_date: string;
  booking_time: string;
  duration_minutes?: number;
  notes?: string;
}

export interface UpdateBookingDto {
  service_id?: string | null;
  booking_date?: string;
  booking_time?: string;
  duration_minutes?: number;
  status?: BookingStatus;
  notes?: string;
  approved_by?: string;
}

export interface BookingFilters {
  client_id?: string;
  vehicle_id?: string;
  status?: BookingStatus;
  date_from?: string;
  date_to?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booking?: BookingWithDetails;
}