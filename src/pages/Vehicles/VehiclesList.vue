<script setup lang="ts">
import { computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useVehiclesQuery, useClientVehiclesQuery } from '@/api/vehicles/queries';
import { useCurrentClientQuery } from '@/api/clients/queries';
import { useDeleteVehicleMutation } from '@/api/vehicles/mutations';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CarOutlined
} from '@ant-design/icons-vue';
import {
  Space,
  Button,
  Tooltip,
  Popconfirm,
  Tag
} from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';

const { t } = useI18n();
const router = useRouter();
const { isAdmin, user } = useGlobalState();
const currentUserId = computed(() => user.value?.id || '');
const currentClient = useCurrentClientQuery(currentUserId, isAdmin);
const currentClientId = computed(() => currentClient.data.value?.id || '');


const vehiclesQuery = isAdmin.value
  ? useVehiclesQuery()
  : useClientVehiclesQuery(currentClientId);

const deleteMutation = useDeleteVehicleMutation();

const dataSource = computed(() => 
  vehiclesQuery.data.value?.map((vehicle) => ({
    key: vehicle.id,
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    license_plate: vehicle.license_plate,
    vin: vehicle.vin || '-',
    mileage: vehicle.mileage,
    client: vehicle.client?.name || '-',
  })) || []
);

const columns: TableColumnsType = [
  {
    title: t('vehicles.vehicle') || 'Vehicle',
    key: 'vehicle',
    sorter: (a: any, b: any) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`),
    customRender: ({ record }: any) => h('div', { class: 'vehicle-cell' }, [
      h('div', { class: 'vehicle-name' }, [
        h(CarOutlined, { style: { marginRight: '8px', color: '#1890ff' } }),
        h('strong', {}, `${record.make} ${record.model}`)
      ]),
      record.year && h('div', { class: 'vehicle-year' }, `${record.year}`)
    ]),
  },
  {
    title: t('vehicles.licensePlate') || 'License Plate',
    dataIndex: 'license_plate',
    key: 'license_plate',
    customRender: ({ text }: any) => h(Tag, { color: 'blue' }, () => text),
  },
  {
    title: t('vehicles.vin') || 'VIN',
    dataIndex: 'vin',
    key: 'vin',
  },
  {
    title: t('vehicles.mileage') || 'Mileage',
    dataIndex: 'mileage',
    key: 'mileage',
    sorter: (a: any, b: any) => (a.mileage || 0) - (b.mileage || 0),
    customRender: ({ text }: any) => text ? `${Number(text).toLocaleString()} km` : '-',
  },
  {
    title: t('vehicles.client') || 'Client',
    dataIndex: 'client',
    key: 'client',
    sorter: (a: any, b: any) => a.client.localeCompare(b.client),
  },
  {
    title: t('common.actions') || 'Actions',
    key: 'actions',
    width: 150,
    align: 'center',
    customRender: ({ record }: any) => h(Space, { size: 4 }, () => [
      h(Tooltip, { title: t('common.view') }, () =>
        h(Button, {
          type: 'text',
          size: 'small',
          icon: h(EyeOutlined),
          onClick: () => router.push(`/vehicles/${record.id}`)
        })
      ),
      isAdmin.value && h(Tooltip, { title: t('common.edit') }, () =>
        h(Button, {
          type: 'text',
          size: 'small',
          icon: h(EditOutlined),
          onClick: () => router.push(`/vehicles/${record.id}/edit`)
        })
      ),
      isAdmin.value && h(Popconfirm, {
        title: t('common.confirmDelete'),
        onConfirm: () => deleteMutation.mutate(record.id)
      }, {
        default: () => h(Tooltip, { title: t('common.delete') }, () =>
          h(Button, {
            type: 'text',
            size: 'small',
            danger: true,
            icon: h(DeleteOutlined),
          })
        )
      })
    ].filter(Boolean)),
  },
];

const handleNew = () => { if (isAdmin.value) router.push('/vehicles/new'); };
</script>

<template>
  <div class="vehicles-list">
    <a-card :bordered="false" class="vehicles-card">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ $t('vehicles.title') || 'Vehicles' }}</span>
          <a-button v-if="isAdmin" type="primary" @click="handleNew" class="new-vehicle-btn">
            <template #icon><PlusOutlined /></template>
            {{ $t('vehicles.new') || 'New Vehicle' }}
          </a-button>
        </div>
      </template>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="vehiclesQuery.isLoading.value"
        :pagination="{ 
          pageSize: 10, 
          showTotal: (total) => `Total ${total} vehicles` 
        }"
        :row-class-name="() => 'table-row'"
      />
    </a-card>
  </div>
</template>

<style scoped lang="scss">
.vehicles-list {
//   padding: 24px;
//   background: #f5f5f5;
  min-height: 100vh;
}

.vehicles-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  :deep(.ant-card-head) {
    border-bottom: 1px solid #f0f0f0;
    padding: 20px 24px;
  }

  :deep(.ant-card-body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    font-size: 20px;
    font-weight: 600;
    color: #262626;
  }

  .new-vehicle-btn {
    border-radius: 8px;
    height: 38px;
    padding: 0 20px;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
    
    &:hover {
      box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
      transform: translateY(-1px);
    }
    
    transition: all 0.3s ease;
  }
}

.vehicle-cell {
  .vehicle-name {
    display: flex;
    align-items: center;
    color: #262626;
    font-weight: 500;
  }

  .vehicle-year {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 2px;
    margin-left: 24px;
  }
}

:deep(.ant-table) {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
    color: #262626;
    border-bottom: 2px solid #f0f0f0;
    padding: 16px 16px;
    font-size: 14px;
    
    &::before {
      display: none;
    }
  }

  .table-row {
    transition: all 0.2s ease;
    
    &:hover {
      background: #fafafa;
    }

    td {
      padding: 16px 16px;
      border-bottom: 1px solid #f5f5f5;
      color: #595959;
    }
  }

  .ant-btn-text {
    transition: all 0.2s ease;
    border-radius: 6px;
    
    &:not(.ant-btn-dangerous):hover {
      background: rgba(24, 144, 255, 0.08);
      color: #1890ff;
    }
    
    &.ant-btn-dangerous:hover {
      background: rgba(255, 77, 79, 0.08);
      color: #ff4d4f;
    }
  }

  .ant-tag {
    border-radius: 6px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
  }
}

:deep(.ant-spin-container) {
  min-height: 400px;
}

:deep(.ant-empty) {
  padding: 60px 0;
}

:deep(.ant-pagination) {
    padding: 16px 16px;
    margin: 0;
}
</style>