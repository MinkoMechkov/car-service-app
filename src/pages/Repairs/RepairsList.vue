<script setup lang="ts">
import { computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuery } from '@tanstack/vue-query';
import { supabase } from '@/utils/supabaseClient';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import {
  Tag,
  Badge,
  Popconfirm,
  Space,
  Button,
  Tooltip
} from 'ant-design-vue';
import dayjs from 'dayjs';
import type { Repair } from '@/api/repairs/interfaces';
import { useDeleteRepairMutation } from '@/api/repairs/mutations';
import type { TableColumnsType } from 'ant-design-vue';

const { t } = useI18n();
const router = useRouter();

interface RepairWithRelations extends Repair {
  vehicle?: {
    make: string;
    model: string;
    license_plate: string;
    client?: {
      name: string;
    };
  };
}

const repairsQuery = useQuery<RepairWithRelations[]>({
  queryKey: ['repairsList'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('repairs')
      .select(`
        *,
        vehicle:vehicles (
          make,
          model,
          license_plate,
          client:clients (name)
        )
      `)
      .order('date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

const deleteMutation = useDeleteRepairMutation();

const getStatus = (repair: RepairWithRelations) => {
  if ((repair as any).status) return (repair as any).status as string;
  if (!repair.date) return 'pending';
  const repairDate = dayjs(repair.date);
  const now = dayjs();
  if (repairDate.isBefore(now) && repair.total_cost) return 'completed';
  if (repairDate.isBefore(now)) return 'in_progress';
  return 'pending';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    in_progress: 'processing',
    pending: 'warning',
    completed: 'success',
    canceled: 'error',
  };
  return colors[status] || 'default';
};

const getPriorityStatus = (priority: string): 'error' | 'default' | 'processing' | 'warning' | 'success' => {
  const statuses: Record<string, 'error' | 'warning' | 'success'> = {
    high: 'error',
    medium: 'warning',
    low: 'success',
    urgent: 'error',
  };
  return statuses[priority] || 'default';
};

const repairsData = computed(() => {
  return repairsQuery.data.value?.map((repair) => ({
    key: repair.id,
    id: repair.id,
    vehicle: `${repair.vehicle?.make || ''} ${repair.vehicle?.model || ''}`.trim() || 'Unknown Vehicle',
    plate: repair.vehicle?.license_plate || '',
    client: repair.vehicle?.client?.name || 'Unknown Client',
    status: getStatus(repair),
    priority: (repair as any).priority || 'low',
    date: repair.date ? dayjs(repair.date).format('YYYY-MM-DD') : '',
    total_cost: repair.total_cost,
  })) || [];
});

const columns: TableColumnsType = [
  {
    title: t('repairs.vehicle'),
    dataIndex: 'vehicle',
    key: 'vehicle',
    sorter: (a: any, b: any) => a.vehicle.localeCompare(b.vehicle),
    customRender: ({ text, record }: any) => h('div', { class: 'vehicle-cell' }, [
      h('strong', {}, text as string),
      h('div', { class: 'plate-text' }, record.plate)
    ]),
  },
  {
    title: t('repairs.client'),
    dataIndex: 'client',
    key: 'client',
    sorter: (a: any, b: any) => a.client.localeCompare(b.client),
  },
  {
    title: t('repairs.status'),
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: t('status.pending'), value: 'pending' },
      { text: t('status.in_progress'), value: 'in_progress' },
      { text: t('status.completed'), value: 'completed' },
      { text: t('status.canceled'), value: 'canceled' },
    ],
    onFilter: (value: any, record: any) => record.status === value,
    customRender: ({ text }: any) => h(Tag, { color: getStatusColor(text as string) }, () => t(`status.${text}`)),
  },
  {
    title: t('repairs.priority'),
    dataIndex: 'priority',
    key: 'priority',
    filters: [
      { text: t('priority.urgent'), value: 'urgent' },
      { text: t('priority.high'), value: 'high' },
      { text: t('priority.medium'), value: 'medium' },
      { text: t('priority.low'), value: 'low' },
    ],
    onFilter: (value: any, record: any) => record.priority === value,
    customRender: ({ text }: any) => h(Badge, { status: getPriorityStatus(text as string), text: t(`priority.${text}`) }),
  },
  {
    title: t('repairs.date'),
    dataIndex: 'date',
    key: 'date',
    sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
  },
  {
    title: t('repairs.totalCost'),
    dataIndex: 'total_cost',
    key: 'total_cost',
    sorter: (a: any, b: any) => (a.total_cost || 0) - (b.total_cost || 0),
    customRender: ({ text }: any) => (text ? `€${Number(text).toFixed(2)}` : '-'),
  },
  {
    title: t('repairs.actions'),
    key: 'actions',
    width: 150,
    align: 'center',
    customRender: ({ record }: any) => h(Space, { size: 4 }, () => [
      h(Tooltip, { title: t('common.view') }, () =>
        h(Button, {
          type: 'text',
          size: 'small',
          icon: h(EyeOutlined),
          onClick: () => router.push(`/repairs/${record.id}`)
        })
      ),
      h(Tooltip, { title: t('common.edit') }, () =>
        h(Button, {
          type: 'text',
          size: 'small',
          icon: h(EditOutlined),
          onClick: () => router.push(`/repairs/${record.id}/edit`)
        })
      ),
      h(Popconfirm, {
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
    ]),
  },
];

const handleNewRepair = () => {
  router.push('/repairs/new');
};
</script>

<template>
  <div class="repair-list">
    <a-card :bordered="false" class="repairs-card">
      <template #title>
        <div class="card-header">
          <span class="card-title">{{ $t('repairs.title') }}</span>
          <a-button type="primary" @click="handleNewRepair" class="new-repair-btn">
            <template #icon><PlusOutlined /></template>
            {{ $t('repairs.new') }}
          </a-button>
        </div>
      </template>
      <a-table
        :columns="columns"
        :data-source="repairsData"
        :loading="repairsQuery.isLoading.value"
        :pagination="{ 
          pageSize: 10, 
          showTotal: (total) => `Total ${total} repairs` 
        }"
        :row-class-name="() => 'table-row'"
      />
    </a-card>
  </div>
</template>

<style scoped lang="scss">
.repair-list {
  min-height: 100vh;
}

.repairs-card {
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

  .new-repair-btn {
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
  strong {
    display: block;
    color: #262626;
    font-weight: 500;
  }

  .plate-text {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 2px;
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

  // Tag and Badge styling
  .ant-tag {
    border-radius: 6px;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
    border: none;
  }

  .ant-badge-status-text {
    font-size: 13px;
    margin-left: 8px;
  }
}

// Loading state improvements
:deep(.ant-spin-container) {
  min-height: 400px;
}

// Empty state
:deep(.ant-empty) {
  padding: 60px 0;
}


:deep(.ant-pagination) {
    padding: 16px 16px;
    margin: 0;
}
</style>