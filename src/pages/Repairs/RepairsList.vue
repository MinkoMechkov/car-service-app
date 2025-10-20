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
  Popconfirm
} from 'ant-design-vue';
import dayjs from 'dayjs';
import type { Repair } from '@/api/repairs/interfaces';
import { useDeleteRepairMutation } from '@/api/repairs/mutations';

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

const columns = [
  {
    title: t('repairs.vehicle'),
    dataIndex: 'vehicle',
    key: 'vehicle',
    customRender: ({ text, record }: any) => h('div', [
      h('strong', {}, text as string),
      h('div', { style: { fontSize: '12px', color: '#999' } }, record.plate)
    ]),
  },
  {
    title: t('repairs.client'),
    dataIndex: 'client',
    key: 'client',
  },
  {
    title: t('repairs.status'),
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }: any) => h(Tag, { color: getStatusColor(text as string) }, t(`status.${text}`)),
  },
  {
    title: t('repairs.priority'),
    dataIndex: 'priority',
    key: 'priority',
    customRender: ({ text }: any) => h(Badge, { status: getPriorityStatus(text as string), text: t(`priority.${text}`) }),
  },
  {
    title: t('repairs.date'),
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: t('repairs.totalCost'),
    dataIndex: 'total_cost',
    key: 'total_cost',
    customRender: ({ text }: any) => (text ? `€${Number(text).toFixed(2)}` : '-'),
  },
  {
    title: t('repairs.actions'),
    key: 'actions',
    customRender: ({ record }: any) => h('span', [
      h('a', {
        style: { marginRight: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' },
        onClick: () => router.push(`/repairs/${record.id}`)
      }, [
        h(EyeOutlined),
        t('common.view')
      ]),
      h('a', {
        style: { marginRight: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' },
        onClick: () => router.push(`/repairs/${record.id}/edit`)
      }, [
        h(EditOutlined),
        t('common.edit')
      ]),
      h(Popconfirm, {
        title: t('common.confirmDelete'),
        onConfirm: () => deleteMutation.mutate(record.id)
      }, {
        default: () => h('a', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } }, [
          h(DeleteOutlined),
          t('common.delete')
        ])
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
    <a-card>
      <template #title>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>{{ $t('repairs.title') }}</span>
          <a-button type="primary" @click="handleNewRepair">
            <PlusOutlined />
            {{ $t('repairs.new') }}
          </a-button>
        </div>
      </template>
      <a-table
        :columns="columns"
        :data-source="repairsData"
        :loading="repairsQuery.isLoading.value"
        :pagination="{ pageSize: 10 }"
      />
    </a-card>
  </div>
</template>

<style scoped lang="scss">
.repair-list {
  padding: 24px;
}
</style>