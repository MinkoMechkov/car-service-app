<script setup lang="ts">
import { computed, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import { useDeleteVehicleMutation } from '@/api/vehicles/mutations';
import { message, Modal } from 'ant-design-vue';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
  DashboardOutlined,
  IdcardOutlined,
  ToolOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue';
import type { Vehicle } from '@/api/vehicles/interfaces';
import dayjs from 'dayjs';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const vehicleId = computed(() => route.params.id as string);

interface VehicleWithRelations extends Vehicle {
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  repairs?: Array<{
    id: string;
    date: string;
    description: string;
    total_cost: number;
  }>;
}

const vehicleQuery = useQuery<VehicleWithRelations>({
  queryKey: ['vehicleDetails', vehicleId.value],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        client:clients (*),
        repairs (
          id,
          date,
          description,
          total_cost
        )
      `)
      .eq('id', vehicleId.value)
      .single();
    if (error) throw error;
    return data;
  },
  enabled: !!vehicleId.value,
});

const deleteMutation = useDeleteVehicleMutation();

const vehicle = computed(() => vehicleQuery.data.value);
const repairs = computed(() => vehicle.value?.repairs || []);

const handleEdit = () => {
  router.push(`/vehicles/${vehicleId.value}/edit`);
};

const handleDelete = () => {
  Modal.confirm({
    title: t('common.confirmDelete'),
    icon: h(ExclamationCircleOutlined),
    content: t('vehicles.confirmDeleteMessage') || 'Are you sure you want to delete this vehicle? This action cannot be undone.',
    okText: t('common.delete'),
    okType: 'danger',
    cancelText: t('common.cancel'),
    onOk: async () => {
      try {
        await deleteMutation.mutateAsync(vehicleId.value);
        message.success(t('vehicles.deleteSuccess') || 'Vehicle deleted successfully');
        router.push('/vehicles');
      } catch (error) {
        message.error(t('vehicles.deleteError') || 'Failed to delete vehicle');
      }
    },
  });
};

const handleBack = () => {
  router.push('/vehicles');
};

const handleClientClick = () => {
  if (vehicle.value?.client?.id) {
    router.push(`/clients/${vehicle.value.client.id}`);
  }
};

const handleRepairClick = (repairId: string) => {
  router.push(`/repairs/${repairId}`);
};
</script>

<template>
  <div class="vehicle-details-container">
    <a-spin :spinning="vehicleQuery.isLoading.value">
      <div v-if="vehicle" class="vehicle-details">
        <!-- Header Card -->
        <a-card :bordered="false" class="header-card">
          <div class="header-content">
            <div class="header-left">
              <a-button @click="handleBack" class="back-btn">
                <template #icon><ArrowLeftOutlined /></template>
              </a-button>
              <div class="vehicle-title">
                <CarOutlined class="title-icon" />
                <div>
                  <h1 class="vehicle-name">{{ vehicle.make }} {{ vehicle.model }}</h1>
                  <div class="vehicle-meta">
                    <a-tag color="blue" class="license-tag">{{ vehicle.license_plate }}</a-tag>
                    <span v-if="vehicle.year" class="year-text">{{ vehicle.year }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <a-button @click="handleEdit" size="large">
                <template #icon><EditOutlined /></template>
                {{ $t('common.edit') }}
              </a-button>
              <a-button danger @click="handleDelete" size="large" :loading="deleteMutation.isPending.value">
                <template #icon><DeleteOutlined /></template>
                {{ $t('common.delete') }}
              </a-button>
            </div>
          </div>
        </a-card>

        <a-row :gutter="24">
          <!-- Vehicle Information -->
          <a-col :xs="24" :lg="12">
            <a-card :bordered="false" class="info-card" :title="$t('vehicles.information') || 'Vehicle Information'">
              <div class="info-list">
                <div class="info-item">
                  <div class="info-label">
                    <CarOutlined />
                    <span>{{ $t('vehicles.make') || 'Make' }}</span>
                  </div>
                  <div class="info-value">{{ vehicle.make }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">
                    <CarOutlined />
                    <span>{{ $t('vehicles.model') || 'Model' }}</span>
                  </div>
                  <div class="info-value">{{ vehicle.model }}</div>
                </div>

                <div class="info-item" v-if="vehicle.year">
                  <div class="info-label">
                    <CalendarOutlined />
                    <span>{{ $t('vehicles.year') || 'Year' }}</span>
                  </div>
                  <div class="info-value">{{ vehicle.year }}</div>
                </div>

                <div class="info-item">
                  <div class="info-label">
                    <IdcardOutlined />
                    <span>{{ $t('vehicles.licensePlate') || 'License Plate' }}</span>
                  </div>
                  <div class="info-value">
                    <a-tag color="blue">{{ vehicle.license_plate }}</a-tag>
                  </div>
                </div>

                <div class="info-item" v-if="vehicle.vin">
                  <div class="info-label">
                    <IdcardOutlined />
                    <span>{{ $t('vehicles.vin') || 'VIN' }}</span>
                  </div>
                  <div class="info-value">{{ vehicle.vin }}</div>
                </div>

                <div class="info-item" v-if="vehicle.mileage">
                  <div class="info-label">
                    <DashboardOutlined />
                    <span>{{ $t('vehicles.mileage') || 'Mileage' }}</span>
                  </div>
                  <div class="info-value">{{ Number(vehicle.mileage).toLocaleString() }} km</div>
                </div>
              </div>
            </a-card>
          </a-col>

          <!-- Client Information -->
          <a-col :xs="24" :lg="12">
            <a-card :bordered="false" class="info-card" :title="$t('vehicles.clientInfo') || 'Client Information'">
              <div v-if="vehicle.client" class="client-info">
                <div class="client-card" @click="handleClientClick">
                  <UserOutlined class="client-icon" />
                  <div class="client-details">
                    <h3 class="client-name">{{ vehicle.client.name }}</h3>
                    <div class="client-contact">
                      <span v-if="vehicle.client.email">{{ vehicle.client.email }}</span>
                      <span v-if="vehicle.client.phone">{{ vehicle.client.phone }}</span>
                    </div>
                  </div>
                  <ArrowLeftOutlined class="client-arrow" style="transform: rotate(180deg)" />
                </div>
              </div>
              <a-empty v-else :description="$t('vehicles.noClient') || 'No client assigned'" />
            </a-card>
          </a-col>
        </a-row>

        <!-- Repair History -->
        <a-card :bordered="false" class="info-card repairs-card">
          <template #title>
            <div style="display: flex; align-items: center; gap: 8px;">
              <ToolOutlined />
              <span>{{ $t('vehicles.repairHistory') || 'Repair History' }}</span>
              <a-badge :count="repairs.length" :number-style="{ backgroundColor: '#1890ff' }" />
            </div>
          </template>

          <div v-if="repairs.length > 0" class="repairs-list">
            <div 
              v-for="repair in repairs" 
              :key="repair.id" 
              class="repair-item"
              @click="handleRepairClick(repair.id)"
            >
              <div class="repair-date">
                <CalendarOutlined />
                <span>{{ dayjs(repair.date).format('MMM DD, YYYY') }}</span>
              </div>
              <div class="repair-description">
                {{ repair.description || 'No description' }}
              </div>
              <div class="repair-cost">
                {{ repair.total_cost ? `€${Number(repair.total_cost).toFixed(2)}` : '-' }}
              </div>
              <ArrowLeftOutlined class="repair-arrow" style="transform: rotate(180deg)" />
            </div>
          </div>
          <a-empty v-else :description="$t('vehicles.noRepairs') || 'No repair history'" />
        </a-card>
      </div>
    </a-spin>
  </div>
</template>

<style scoped lang="scss">
.vehicle-details-container {
//   padding: 24px;
//   background: #f5f5f5;
  min-height: 100vh;
}

.vehicle-details {
//   max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;

  :deep(.ant-card-body) {
    padding: 24px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  border-radius: 8px;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
  }
}

.vehicle-title {
  display: flex;
  align-items: center;
  gap: 16px;

  .title-icon {
    font-size: 32px;
    color: #1890ff;
  }
}

.vehicle-name {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
  line-height: 1.2;
}

.vehicle-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;

  .license-tag {
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
  }

  .year-text {
    color: #8c8c8c;
    font-size: 14px;
  }
}

.header-actions {
  display: flex;
  gap: 12px;

  .ant-btn {
    border-radius: 8px;
    height: 40px;
    padding: 0 24px;
    font-weight: 500;
    
    &.ant-btn-primary {
      box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
    }
    
    &.ant-btn-dangerous {
      box-shadow: 0 2px 4px rgba(255, 77, 79, 0.2);
    }
    
    transition: all 0.3s ease;
  }
}

.info-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;

  :deep(.ant-card-head) {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;

    .ant-card-head-title {
      font-weight: 600;
      color: #262626;
    }
  }

  :deep(.ant-card-body) {
    padding: 24px;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 14px;

  .anticon {
    font-size: 16px;
    color: #1890ff;
  }
}

.info-value {
  font-weight: 500;
  color: #262626;
  font-size: 15px;
}

.client-info {
  margin: -8px;
}

.client-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0;
    transform: translateX(4px);
  }

  .client-icon {
    font-size: 32px;
    color: #1890ff;
  }

  .client-details {
    flex: 1;
  }

  .client-name {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 4px 0;
  }

  .client-contact {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 13px;
    color: #8c8c8c;
  }

  .client-arrow {
    color: #8c8c8c;
    font-size: 16px;
  }
}

.repairs-card {
  :deep(.ant-card-head-title) {
    display: flex;
    align-items: center;
  }
}

.repairs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.repair-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0;
    transform: translateX(4px);
  }

  .repair-date {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 140px;
    color: #595959;
    font-size: 14px;

    .anticon {
      color: #1890ff;
    }
  }

  .repair-description {
    flex: 1;
    color: #262626;
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .repair-cost {
    min-width: 100px;
    text-align: right;
    font-weight: 600;
    color: #52c41a;
    font-size: 15px;
  }

  .repair-arrow {
    color: #8c8c8c;
    font-size: 16px;
    flex-shrink: 0;
  }
}

:deep(.ant-empty) {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    
    .ant-btn {
      flex: 1;
    }
  }

  .repair-item {
    flex-wrap: wrap;

    .repair-date {
      min-width: auto;
    }

    .repair-description {
      width: 100%;
      order: 3;
      margin-top: 8px;
    }

    .repair-cost {
      min-width: auto;
    }
  }
}
</style>