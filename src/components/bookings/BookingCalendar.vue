<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import {
    PlusOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CarOutlined,
    UserOutlined,
  } from '@ant-design/icons-vue';
  import {
    useBookingsQuery,
    useMyBookingsQuery,
    useAvailableTimeSlotsQuery,
    useBookingsCountByStatusQuery,
  } from '@/api/bookings/queries';
  import {
    useCreateBookingMutation,
    useApproveBookingMutation,
    useCancelBookingMutation,
  } from '@/api/bookings/mutations';
  import type { BookingWithDetails, TimeSlot, CreateBookingDto } from '@/api/bookings/interfaces';
  import { useClientsQuery } from '@/api/clients/queries';
  import { useVehiclesQuery, useClientVehiclesQuery } from '@/api/vehicles/queries';
  import { useServicesQuery } from '@/api/services/queries';

  const { userId, role, isAdmin } = useGlobalState();
  const clientId = computed(() => {
    if (role.value === 'admin') return undefined;
    return props.clientId;
  });

  // Props
  interface Props {
    isAdmin?: boolean;
    clientId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    isAdmin: false,
    clientId: undefined,
  });

  useBookingsRealtimeSync(userId.value, role.value as 'admin' | 'client', clientId.value);

  const { data: vehicles, isLoading: isLoadingVehicles } = props.isAdmin
    ? useVehiclesQuery()
    : useClientVehiclesQuery(props.clientId ?? '', { enabled: computed(() => !!props.clientId) });
  const { data: clients, isLoading: isLoadingClients } = useClientsQuery();
  const { data: services, isLoading: isLoadingServices } = useServicesQuery();

  // State
  const selectedDate = ref<Dayjs>(dayjs());
  const selectedDateString = computed(() => selectedDate.value.format('YYYY-MM-DD'));

  // Queries
  const { data: bookings, isLoading: isLoadingBookings } = props.isAdmin
    ? useBookingsQuery()
    : useMyBookingsQuery();

  const { data: timeSlots, isLoading: isLoadingSlots } =
    useAvailableTimeSlotsQuery(selectedDateString);

  const { data: bookingCounts } = useBookingsCountByStatusQuery();

  const pendingCount = computed(() => bookingCounts.value?.pending || 0);

  // Mutations
  const createMutation = useCreateBookingMutation();
  const approveMutation = useApproveBookingMutation();
  const cancelMutation = useCancelBookingMutation();

  // Modal state
  const bookingModalVisible = ref(false);
  const detailsModalVisible = ref(false);
  const selectedBooking = ref<BookingWithDetails | null>(null);
  const editingBooking = ref<BookingWithDetails | null>(null);

  // Form
  const bookingFormRef = ref();
  const bookingForm = reactive<{
    client_id: string;
    vehicle_id: string;
    service_id: string | null;
    booking_date: Dayjs | null;
    booking_time: Dayjs | null;
    duration_minutes: number;
    notes: string;
  }>({
    client_id: props.clientId || '',
    vehicle_id: '',
    service_id: null,
    booking_date: dayjs(),
    booking_time: dayjs().hour(9).minute(0),
    duration_minutes: 60,
    notes: '',
  });

  const bookingRules = {
    client_id: [{ required: props.isAdmin, message: 'Please select a client' }],
    vehicle_id: [{ required: true, message: 'Please select a vehicle' }],
    booking_date: [{ required: true, message: 'Please select a date' }],
    booking_time: [{ required: true, message: 'Please select a time' }],
  };

  // Replace the old availableVehicles
  const availableVehicles = computed(() => {
    const allVehicles = vehicles.value ?? [];

    if (!props.isAdmin) {
      return allVehicles; // Already filtered by useClientVehiclesQuery
    }

    // Admin: filter by selected client
    if (!bookingForm.client_id) {
      return [];
    }

    return allVehicles.filter((vehicle) => vehicle.client_id === bookingForm.client_id);
  });

  watch(
    () => bookingForm.client_id,
    () => {
      bookingForm.vehicle_id = '';
    },
    { immediate: false }
  );

  // Methods
  const onDateSelect = (date: Dayjs) => {
    selectedDate.value = date;
  };

  const getBookingsForDate = (date: Dayjs): BookingWithDetails[] => {
    if (!bookings.value) return [];
    const dateStr = date.format('YYYY-MM-DD');
    return bookings.value.filter((b) => b.booking_date === dateStr && b.status !== 'cancelled');
  };

  const getDateBadgeColor = (date: Dayjs): string => {
    const bookingsForDate = getBookingsForDate(date);
    const hasPending = bookingsForDate.some((b) => b.status === 'pending');
    return hasPending ? '#faad14' : '#52c41a';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'orange',
      confirmed: 'green',
      cancelled: 'red',
      completed: 'blue',
    };
    return colors[status] || 'default';
  };

  const formatTime = (time: string): string => {
    return dayjs(`2000-01-01 ${time}`).format('HH:mm');
  };

  const formatDateTime = (date: string, time: string): string => {
    return `${dayjs(date).format('MMMM D, YYYY')} at ${formatTime(time)}`;
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;

    bookingForm.booking_date = selectedDate.value;
    bookingForm.booking_time = dayjs(`2000-01-01 ${slot.time}`);
    showBookingModal();
  };

  const showBookingModal = () => {
    bookingModalVisible.value = true;
  };

  const closeBookingModal = () => {
    bookingModalVisible.value = false;
    editingBooking.value = null;
    bookingFormRef.value?.resetFields();
  };

  const filterOption = (input: string, option: any) => {
    return option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const handleBookingSubmit = async () => {
    try {
      await bookingFormRef.value?.validate();

      const dto: CreateBookingDto = {
        client_id: bookingForm.client_id || props.clientId!,
        vehicle_id: bookingForm.vehicle_id,
        service_id: bookingForm.service_id,
        booking_date: bookingForm.booking_date!.format('YYYY-MM-DD'),
        booking_time: bookingForm.booking_time!.format('HH:mm:ss'),
        duration_minutes: bookingForm.duration_minutes,
        notes: bookingForm.notes || undefined,
      };

      await createMutation.mutateAsync(dto);

      message.success('Booking created successfully');
      closeBookingModal();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(error.message || 'Failed to create booking');
    }
  };

  const handleApproveBooking = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Booking approved');
      detailsModalVisible.value = false;
    } catch (error: any) {
      message.error(error.message || 'Failed to approve booking');
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      message.success('Booking cancelled');
      detailsModalVisible.value = false;
    } catch (error: any) {
      message.error(error.message || 'Failed to cancel booking');
    }
  };

  const viewBookingDetails = (booking: BookingWithDetails) => {
    selectedBooking.value = booking;
    detailsModalVisible.value = true;
  };
</script>

<template>
  <div class="booking-calendar">
    <a-card :loading="isLoadingBookings" :bordered="false">
      <template #title>
        <div class="calendar-header">
          <h2>{{ isAdmin ? 'Booking Management' : 'My Bookings' }}</h2>
          <a-space>
            <a-badge :count="pendingCount" :overflow-count="99">
              <a-button v-if="isAdmin" type="primary" @click="showBookingModal()">
                <template #icon><PlusOutlined /></template>
                New Booking
              </a-button>
              <a-button v-else type="primary" @click="showBookingModal()">
                <template #icon><PlusOutlined /></template>
                Book Service
              </a-button>
            </a-badge>
          </a-space>
        </div>
      </template>

      <a-row :gutter="[16, 16]">
        <!-- Calendar Section -->
        <a-col :xs="24" :lg="16">
          <a-calendar v-model:value="selectedDate" :fullscreen="false" @select="onDateSelect">
            <template #dateCellRender="{ current }">
              <div class="date-cell">
                <a-badge
                  v-if="getBookingsForDate(current).length > 0"
                  :count="getBookingsForDate(current).length"
                  :number-style="{ backgroundColor: getDateBadgeColor(current) }" />
              </div>
            </template>
          </a-calendar>
        </a-col>

        <!-- Daily Schedule Section -->
        <a-col :xs="24" :lg="8">
          <a-card title="Schedule" :bordered="false" class="schedule-card">
            <template #extra>
              <a-typography-text type="secondary">
                {{ selectedDate.format('MMMM D, YYYY') }}
              </a-typography-text>
            </template>

            <a-spin :spinning="isLoadingSlots">
              <div class="time-slots">
                <a-empty
                  v-if="!timeSlots || timeSlots.length === 0"
                  description="No time slots available" />

                <div
                  v-for="slot in timeSlots"
                  :key="slot.time"
                  class="time-slot"
                  :class="{
                    available: slot.available,
                    booked: !slot.available,
                  }"
                  @click="slot.available && handleTimeSlotClick(slot)">
                  <div class="slot-time">
                    <ClockCircleOutlined />
                    {{ formatTime(slot.time) }}
                  </div>

                  <div v-if="!slot.available && slot.booking" class="slot-details">
                    <a-tag :color="getStatusColor(slot.booking.status)">
                      {{ slot.booking.status }}
                    </a-tag>
                    <div class="booking-info">
                      <CarOutlined />
                      <span>{{ slot.booking.vehicle.make }} {{ slot.booking.vehicle.model }}</span>
                    </div>
                    <div class="booking-info">
                      <UserOutlined />
                      <span>{{ slot.booking.client.name }}</span>
                    </div>

                    <a-space class="slot-actions" v-if="isAdmin">
                      <a-button
                        size="small"
                        type="link"
                        @click.stop="viewBookingDetails(slot.booking)">
                        View
                      </a-button>
                      <a-button
                        v-if="slot.booking.status === 'pending'"
                        size="small"
                        type="link"
                        :loading="approveMutation.isPending.value"
                        @click.stop="handleApproveBooking(slot.booking.id)">
                        Approve
                      </a-button>
                    </a-space>
                  </div>

                  <div v-else-if="slot.available" class="slot-available">
                    <CheckCircleOutlined />
                    Available
                  </div>
                </div>
              </div>
            </a-spin>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- Booking Modal -->
    <a-modal
      v-model:open="bookingModalVisible"
      :title="editingBooking ? 'Edit Booking' : 'New Booking'"
      width="600px"
      @ok="handleBookingSubmit"
      @cancel="closeBookingModal"
      :confirmLoading="createMutation.isPending.value">
      <a-form ref="bookingFormRef" :model="bookingForm" :rules="bookingRules" layout="vertical">
        <a-form-item label="Client" name="client_id" v-if="isAdmin">
          <a-select
            v-model:value="bookingForm.client_id"
            placeholder="Select client"
            show-search
            :filter-option="filterOption"
            :loading="isLoadingClients">
            <a-select-option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Vehicle" name="vehicle_id">
          <a-select
            v-model:value="bookingForm.vehicle_id"
            placeholder="Select vehicle"
            :disabled="!props.isAdmin && !props.clientId"
            :loading="isLoadingVehicles">
            <a-select-option
              v-for="vehicle in availableVehicles"
              :key="vehicle.id"
              :value="vehicle.id">
              {{ vehicle.make }} {{ vehicle.model }} - {{ vehicle.license_plate }}
            </a-select-option>
            <template
              v-if="props.isAdmin && bookingForm.client_id && availableVehicles.length === 0">
              <a-select-option disabled> No vehicles found for this client </a-select-option>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item label="Service" name="service_id">
          <a-select
            v-model:value="bookingForm.service_id"
            placeholder="Select service (optional)"
            allow-clear
            :loading="isLoadingServices">
            <a-select-option v-for="service in services" :key="service.id" :value="service.id">
              {{ service.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Date" name="booking_date">
              <a-date-picker
                v-model:value="bookingForm.booking_date"
                style="width: 100%"
                :disabled-date="disabledDate" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Time" name="booking_time">
              <a-time-picker
                v-model:value="bookingForm.booking_time"
                format="HH:mm"
                style="width: 100%"
                :minute-step="30" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Duration (minutes)" name="duration_minutes">
          <a-input-number
            v-model:value="bookingForm.duration_minutes"
            :min="30"
            :max="480"
            :step="30"
            style="width: 100%" />
        </a-form-item>

        <a-form-item label="Notes" name="notes">
          <a-textarea
            v-model:value="bookingForm.notes"
            :rows="3"
            placeholder="Additional notes or special requirements" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Booking Details Modal -->
    <a-modal
      v-model:open="detailsModalVisible"
      title="Booking Details"
      width="600px"
      :footer="null">
      <a-descriptions v-if="selectedBooking" :column="1" bordered>
        <a-descriptions-item label="Status">
          <a-tag :color="getStatusColor(selectedBooking.status)">
            {{ selectedBooking.status.toUpperCase() }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Client">
          {{ selectedBooking.client.name }}
        </a-descriptions-item>
        <a-descriptions-item label="Phone">
          {{ selectedBooking.client.phone || 'N/A' }}
        </a-descriptions-item>
        <a-descriptions-item label="Email">
          {{ selectedBooking.client.email || 'N/A' }}
        </a-descriptions-item>
        <a-descriptions-item label="Vehicle">
          {{ selectedBooking.vehicle.make }} {{ selectedBooking.vehicle.model }}
        </a-descriptions-item>
        <a-descriptions-item label="License Plate">
          {{ selectedBooking.vehicle.license_plate }}
        </a-descriptions-item>
        <a-descriptions-item label="Service">
          {{ selectedBooking.service?.name || 'General Service' }}
        </a-descriptions-item>
        <a-descriptions-item label="Date & Time">
          {{ formatDateTime(selectedBooking.booking_date, selectedBooking.booking_time) }}
        </a-descriptions-item>
        <a-descriptions-item label="Duration">
          {{ selectedBooking.duration_minutes }} minutes
        </a-descriptions-item>
        <a-descriptions-item label="Notes" v-if="selectedBooking.notes">
          {{ selectedBooking.notes }}
        </a-descriptions-item>
      </a-descriptions>

      <a-space style="margin-top: 16px; width: 100%; justify-content: flex-end">
        <a-button
          v-if="selectedBooking.status === 'pending' && isAdmin"
          type="primary"
          :loading="approveMutation.isPending.value"
          @click="handleApproveBooking(selectedBooking.id)">
          Approve
        </a-button>
        <a-button
          v-if="['pending', 'confirmed'].includes(selectedBooking.status)"
          danger
          :loading="cancelMutation.isPending.value"
          @click="handleCancelBooking(selectedBooking.id)">
          Cancel Booking
        </a-button>
        <a-button @click="detailsModalVisible = false">Close</a-button>
      </a-space>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
  .booking-calendar {
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 1.5rem 0;

      h2 {
        margin: 0;
      }
    }

    .date-cell {
      text-align: center;
    }

    .schedule-card {
      height: 100%;
      min-height: 500px;
    }

    .time-slots {
      max-height: 500px;
      overflow-y: auto;
    }

    .time-slot {
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 8px;
      border: 1px solid #d9d9d9;
      cursor: pointer;
      transition: all 0.3s;

      &.available {
        background: #f6ffed;
        border-color: #b7eb8f;

        &:hover {
          border-color: #52c41a;
          box-shadow: 0 2px 8px rgba(82, 196, 26, 0.15);
        }
      }

      &.booked {
        background: #fff;
        cursor: default;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
      }

      .slot-time {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .slot-details {
        margin-top: 8px;
      }

      .booking-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        font-size: 13px;
        color: #666;
      }

      .slot-available {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #52c41a;
        font-weight: 500;
      }

      .slot-actions {
        margin-top: 8px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>
