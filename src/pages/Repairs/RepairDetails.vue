<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { useRepairDetailsQuery } from '@/api/repairs/queries';

const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id || ''));

const detailsQuery = useRepairDetailsQuery(id.value);

const goBack = () => router.back();
const goEdit = () => router.push(`/repairs/${id.value}/edit`);
</script>

<template>
  <div class="repair-details">
    <a-card :loading="detailsQuery.isLoading.value">
      <template #title>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>{{ detailsQuery.data.value?.vehicle ? `${detailsQuery.data.value.vehicle.make} ${detailsQuery.data.value.vehicle.model}` : 'Repair Details' }}</span>
          <a-space>
            <a-button @click="goBack">{{ $t('common.back') }}</a-button>
            <a-button type="primary" @click="goEdit">{{ $t('common.edit') }}</a-button>
          </a-space>
        </div>
      </template>

      <a-descriptions bordered :column="1">
        <a-descriptions-item :label="$t('repairs.status')">
          {{ detailsQuery.data.value?.status ? $t(`status.${detailsQuery.data.value.status}`) : '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.date')">
          {{ detailsQuery.data.value?.date ? dayjs(detailsQuery.data.value.date).format('YYYY-MM-DD') : '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.vehicle')">
          <template v-if="detailsQuery.data.value?.vehicle">
            {{ detailsQuery.data.value.vehicle.make }} {{ detailsQuery.data.value.vehicle.model }}
            <span style="color:#999;margin-left:8px">{{ detailsQuery.data.value.vehicle.license_plate }}</span>
          </template>
          <template v-else>-</template>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.client')">
          {{ detailsQuery.data.value?.vehicle?.client?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.priority')">
          {{ detailsQuery.data.value?.priority ? $t(`priority.${detailsQuery.data.value.priority}`) : '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.totalCost')">
          <template v-if="detailsQuery.data.value?.total_cost !== null && detailsQuery.data.value?.total_cost !== undefined">
            €{{ Number(detailsQuery.data.value.total_cost).toFixed(2) }}
          </template>
          <template v-else>-</template>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.mileageAtService')">
          {{ detailsQuery.data.value?.mileage_at_service ?? '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.nextServiceKm')">
          {{ detailsQuery.data.value?.next_service_km ?? '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.nextServiceDate')">
          {{ detailsQuery.data.value?.next_service_date ? dayjs(detailsQuery.data.value.next_service_date).format('YYYY-MM-DD') : '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('repairs.description')">
          <div style="white-space:pre-wrap">{{ detailsQuery.data.value?.description || '-' }}</div>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>
