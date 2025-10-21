<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs, { type Dayjs } from 'dayjs';
import { message } from 'ant-design-vue';
import type { Repair, RepairPriority, RepairStatus } from '@/api/repairs/interfaces';
import { useRepairQuery } from '@/api/repairs/queries';
import { useCreateRepairMutation, useUpdateRepairMutation } from '@/api/repairs/mutations';
import { useVehiclesQuery } from '@/api/vehicles/queries';

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);

type RepairFormModel = {
  vehicle_id: string | undefined;
  date: Dayjs | null;
  description: string;
  total_cost: number | null;
  mileage_at_service: number | null;
  next_service_km: number | null;
  next_service_date: Dayjs | null;
  priority: RepairPriority | null;
  status: RepairStatus | null;
};

const formState = reactive<RepairFormModel>({
  vehicle_id: undefined,
  date: null,
  description: '',
  total_cost: null,
  mileage_at_service: null,
  next_service_km: null,
  next_service_date: null,
  priority: 'low',
  status: 'pending',
});

const vehiclesQuery = useVehiclesQuery();
const repairQuery = useRepairQuery(String(route.params.id || ''));

watch(
  () => repairQuery.data.value,
  (repair) => {
    if (!repair) return;
    formState.vehicle_id = repair.vehicle_id || undefined;
    formState.date = repair.date ? dayjs(repair.date) : null;
    formState.description = repair.description || '';
    formState.total_cost = repair.total_cost ?? null;
    formState.mileage_at_service = repair.mileage_at_service ?? null;
    formState.next_service_km = repair.next_service_km ?? null;
    formState.next_service_date = repair.next_service_date ? dayjs(repair.next_service_date) : null;
    formState.priority = repair.priority || 'low';
    formState.status = (repair as any).status || 'pending';
  },
  { immediate: true }
);

const createMutation = useCreateRepairMutation();
const updateMutation = useUpdateRepairMutation();

const submit = async () => {
  const payload: Omit<Repair, 'id' | 'created_at'> = {
    vehicle_id: formState.vehicle_id || null,
    date: formState.date ? formState.date.format('YYYY-MM-DD') : null,
    description: formState.description || null,
    total_cost: formState.total_cost ?? null,
    mileage_at_service: formState.mileage_at_service ?? null,
    next_service_km: formState.next_service_km ?? null,
    next_service_date: formState.next_service_date ? formState.next_service_date.format('YYYY-MM-DD') : null,
    priority: formState.priority || null,
    status: formState.status || null,
  };
  try {
    if (isEditMode.value) {
      await updateMutation.mutateAsync({ id: String(route.params.id), ...payload });
      message.success('Repair updated');
    } else {
      await createMutation.mutateAsync(payload);
      message.success('Repair created');
    }
    router.push('/repairs');
  } catch (err: any) {
    message.error(err?.message || 'Operation failed');
  }
};

const onFinishFailed = () => {
  message.error('Please fix validation errors');
};

const cancel = () => {
  router.back();
};

const submitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value);
</script>

<template>
  <div class="repair-form">
    <a-card :title="isEditMode ? $t('repairs.editTitle') : $t('repairs.newTitle')">
      <a-form layout="vertical" :model="formState" @finish="submit" @finishFailed="onFinishFailed">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item :label="$t('repairs.vehicle')" name="vehicle_id" :rules="[{ required: true, message: $t('validation.required') }]">
              <a-select
                v-model:value="formState.vehicle_id"
                :loading="vehiclesQuery.isLoading.value"
                show-search
                allow-clear
                :filter-option="(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())"
                :options="(vehiclesQuery.data.value || []).map(v => ({ value: v.id, label: `${v.make} ${v.model} • ${v.license_plate}` }))"
                placeholder="Select vehicle"
              />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :md="12">
            <a-form-item :label="$t('repairs.date')" name="date" :rules="[{ required: true, message: $t('validation.required') }]">
              <a-date-picker v-model:value="formState.date" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :xs="24">
            <a-form-item :label="$t('repairs.description')" name="description">
              <a-textarea v-model:value="formState.description" :rows="3" />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :md="12">
            <a-form-item :label="$t('repairs.totalCost')" name="total_cost">
              <a-input-number v-model:value="formState.total_cost" :min="0" style="width: 100%" :formatter="value => value === null ? '' : `€ ${value}`" :parser="value => Number(String(value).replace(/[^0-9.]/g, ''))" />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :md="12">
            <a-form-item :label="$t('repairs.mileageAtService')" name="mileage_at_service">
              <a-input-number v-model:value="formState.mileage_at_service" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :md="12">
            <a-form-item :label="$t('repairs.nextServiceKm')" name="next_service_km">
              <a-input-number v-model:value="formState.next_service_km" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :md="12">
            <a-form-item :label="$t('repairs.nextServiceDate')" name="next_service_date">
              <a-date-picker v-model:value="formState.next_service_date" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :md="12">
            <a-form-item :label="$t('repairs.priority')" name="priority">
              <a-segmented v-model:value="formState.priority" :options="[
                { label: $t('priority.low'), value: 'low' },
                { label: $t('priority.medium'), value: 'medium' },
                { label: $t('priority.high'), value: 'high' },
                { label: $t('priority.urgent'), value: 'urgent' },
              ]" />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :md="12">
            <a-form-item :label="$t('dashboard.status')" name="status">
              <a-segmented v-model:value="formState.status" :options="[
                { label: $t('status.pending'), value: 'pending' },
                { label: $t('status.in_progress'), value: 'in_progress' },
                { label: $t('status.completed'), value: 'completed' },
                { label: $t('status.canceled'), value: 'canceled' },
              ]" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-space>
          <a-button @click="cancel">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" html-type="submit" :loading="submitting">
            {{ isEditMode ? $t('common.update') : $t('common.create') }}
          </a-button>
        </a-space>
      </a-form>
    </a-card>
  </div>
  
</template>


