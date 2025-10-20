<script setup lang="ts">
import { computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClientsQuery } from '@/api/clients/queries';
import { useDeleteClientMutation } from '@/api/clients/mutations';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { Popconfirm } from 'ant-design-vue';

const { t } = useI18n();
const router = useRouter();

const clientsQuery = useClientsQuery();
const deleteMutation = useDeleteClientMutation();

const dataSource = computed(() => (clientsQuery.data.value || []).map((c) => ({
  key: c.id,
  id: c.id,
  name: c.name,
  phone: c.phone || '-',
  email: c.email || '-',
  address: c.address || '-',
})));

const columns = [
  { title: t('dashboard.client'), dataIndex: 'name', key: 'name' },
  { title: t('auth.email'), dataIndex: 'email', key: 'email' },
  { title: t('clients.phone') || 'Phone', dataIndex: 'phone', key: 'phone' },
  { title: t('clients.address') || 'Address', dataIndex: 'address', key: 'address' },
  {
    title: t('dashboard.actions'),
    key: 'actions',
    customRender: ({ record }: any) => h('span', [
      h('a', { style: { marginRight: '12px' }, onClick: () => router.push(`/clients/${record.id}`) }, [h(EyeOutlined), t('common.view')]),
      h('a', { style: { marginRight: '12px' }, onClick: () => router.push(`/clients/${record.id}/edit`) }, [h(EditOutlined), t('common.edit')]),
      h(Popconfirm, {
        title: t('common.confirmDelete'),
        onConfirm: () => deleteMutation.mutate(record.id),
      }, { default: () => h('a', [h(DeleteOutlined), t('common.delete')]) })
    ])
  }
];

const handleNew = () => router.push('/clients/new');
</script>

<template>
  <div class="clients-list">
    <a-card>
      <template #title>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>{{ $t('clients.title') || 'Clients' }}</span>
          <a-button type="primary" @click="handleNew">
            <PlusOutlined />
            {{ $t('clients.new') || 'New Client' }}
          </a-button>
        </div>
      </template>
      <a-table :columns="columns" :data-source="dataSource" :loading="clientsQuery.isLoading.value" :pagination="{ pageSize: 10 }" />
    </a-card>
  </div>
  
</template>

<style scoped lang="scss">
.clients-list { padding: 24px; }
</style>


