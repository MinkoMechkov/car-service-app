<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClientQuery } from '@/api/clients/queries';

const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id || ''));
const clientQuery = useClientQuery(id.value);

const goBack = () => router.back();
const goEdit = () => router.push(`/clients/${id.value}/edit`);
</script>

<template>
  <div class="client-details">
    <a-card :loading="clientQuery.isLoading.value">
      <template #title>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>{{ clientQuery.data.value?.name || 'Client Details' }}</span>
          <a-space>
            <a-button @click="goBack">{{ $t('common.back') }}</a-button>
            <a-button type="primary" @click="goEdit">{{ $t('common.edit') }}</a-button>
          </a-space>
        </div>
      </template>

      <a-descriptions bordered :column="1">
        <a-descriptions-item :label="$t('clients.name') || 'Name'">
          {{ clientQuery.data.value?.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('clients.email') || $t('auth.email')">
          {{ clientQuery.data.value?.email || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('clients.phone') || 'Phone'">
          {{ clientQuery.data.value?.phone || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('clients.address') || 'Address'">
          {{ clientQuery.data.value?.address || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('clients.notes') || 'Notes'">
          <div style="white-space:pre-wrap">{{ clientQuery.data.value?.notes || '-' }}</div>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>