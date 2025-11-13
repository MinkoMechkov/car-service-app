<script setup lang="ts">
  import { computed } from 'vue';
  import {
    EditOutlined,
    ArrowLeftOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ToolOutlined,
    ExclamationCircleOutlined,
    AppstoreOutlined,
  } from '@ant-design/icons-vue';
  import { Modal, message } from 'ant-design-vue';
  import { useOfferDetails } from '@/api/offers/queries';
  import { useRespondToOffer } from '@/api/offers/mutations';
  import { useCreateRepairFromOfferMutation } from '@/api/offers/mutations';

  import dayjs from 'dayjs';

  const { t } = useI18n();

  const router = useRouter();
  const route = useRoute();

  const { role, userId } = useGlobalState();

  const isAdmin = computed(() => role.value === 'admin');

  useOffersRealtimeSync(userId.value, role.value);

  const offerId = computed(() => route.params.id as string);

  const offerQuery = useOfferDetails(offerId.value);

  const offer = computed(() => offerQuery.data.value);

  const respondMutation = useRespondToOffer();

  const mutation = useCreateRepairFromOfferMutation();

  const handleAccept = (offerId: string, title: string) => {
    Modal.confirm({
      title: t('offers.confirmAccept') || 'Accept Offer',
      icon: h(CheckCircleOutlined, { style: { color: '#52c41a' } }),
      content:
        t('offers.confirmAcceptMessage', { title }) ||
        `Are you sure you want to accept "${title}"?`,
      okText: t('offers.accept'),
      okType: 'primary',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await respondMutation.mutateAsync({
            offerId,
            response: 'accepted',
          });
          message.success(t('offers.acceptSuccess') || 'Offer accepted!');
          // Refresh query
          offerQuery.refetch();
        } catch (error) {
          message.error(t('offers.acceptError') || 'Failed to accept');
        }
      },
    });
  };

  const handleDecline = (offerId: string, title: string) => {
    Modal.confirm({
      title: t('offers.confirmDecline') || 'Decline Offer',
      icon: h(ExclamationCircleOutlined, { style: { color: '#ff4d4f' } }),
      content:
        t('offers.confirmDeclineMessage', { title }) ||
        `Are you sure you want to decline "${title}"?`,
      okText: t('offers.decline'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await respondMutation.mutateAsync({
            offerId,
            response: 'declined',
          });
          message.success(t('offers.declineSuccess') || 'Offer declined!');
          offerQuery.refetch();
        } catch (error) {
          message.error(t('offers.declineError') || 'Failed to decline');
        }
      },
    });
  };

  const createRepair = async () => {
    await mutation.mutateAsync(route.params.id as string);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      accepted: 'success',
      declined: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: CalendarOutlined,
      accepted: CheckCircleOutlined,
      declined: CloseCircleOutlined,
    };
    return icons[status] || CalendarOutlined;
  };

  const calculateTotal = () => {
    if (!offer.value) return 0;

    const partsTotal = (offer.value.parts || []).reduce(
      (sum, part) => sum + part.price * part.quantity,
      0
    );
    const servicesTotal = (offer.value.services || []).reduce(
      (sum, service) => sum + service.price,
      0
    );
    return partsTotal + servicesTotal + (offer.value.labor_cost || 0);
  };

  const handleEdit = () => {
    router.push(`/offers/${offerId.value}/edit`);
  };

  const handleBack = () => {
    router.push('/offers');
  };

  const handleClientClick = () => {
    if (offer.value?.client?.id) {
      router.push(`/clients/${offer.value.client.id}`);
    }
  };
</script>

<template>
  <div class="offer-details-container">
    <a-spin :spinning="offerQuery.isLoading.value">
      <div v-if="offer" class="offer-details">
        <!-- Header Card -->
        <a-card :bordered="false" class="header-card">
          <div class="header-content">
            <div class="header-left">
              <a-button @click="handleBack" class="back-btn">
                <template #icon><ArrowLeftOutlined /></template>
              </a-button>
              <div class="offer-title-section">
                <FileTextOutlined class="title-icon" />
                <div>
                  <h1 class="offer-title">
                    {{ offer.title }}
                  </h1>
                  <div class="offer-meta">
                    <a-tag :color="getStatusColor(offer.status)" class="status-tag">
                      <component :is="getStatusIcon(offer.status)" style="margin-right: 4px" />
                      {{
                        $t(
                          `offers.status${offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}`
                        )
                      }}
                    </a-tag>
                    <span class="date-text">{{
                      dayjs(offer.created_at).format('MMM DD, YYYY')
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <!-- Admin: Edit if pending -->
              <a-button
                v-if="isAdmin && offer.status === 'pending'"
                @click="handleEdit"
                size="large">
                <template #icon><EditOutlined /></template>
                {{ $t('common.edit') }}
              </a-button>

              <a-button
                type="primary"
                v-if="offer.status === 'accepted' && !offer.repair_id && isAdmin"
                @click="createRepair"
                :loading="mutation.isPending.value">
                Create Repair from Offer
              </a-button>

              <a-alert
                v-else-if="offer.repair_id"
                message="A repair has already been created for this offer."
                type="info"
                show-icon />

              <!-- Client: Accept/Decline if pending -->
              <div v-else-if="!isAdmin && offer.status === 'pending'" class="client-actions">
                <a-button
                  type="primary"
                  size="large"
                  @click="handleAccept(offer.id, offer.title)"
                  :loading="respondMutation.isPending.value">
                  <template #icon><CheckCircleOutlined /></template>
                  {{ $t('offers.accept') }}
                </a-button>
                <a-button
                  danger
                  size="large"
                  @click="handleDecline(offer.id, offer.title)"
                  :loading="respondMutation.isPending.value">
                  <template #icon><CloseCircleOutlined /></template>
                  {{ $t('offers.decline') }}
                </a-button>
              </div>
            </div>
          </div>
        </a-card>

        <a-row :gutter="24">
          <!-- Left Column -->
          <a-col :xs="24" :lg="16">
            <!-- Description -->
            <a-card
              v-if="offer.description"
              :bordered="false"
              class="info-card"
              :title="$t('offers.description') || 'Description'">
              <p class="description-text">
                {{ offer.description }}
              </p>
            </a-card>

            <!-- Parts -->
            <a-card
              v-if="offer.parts && offer.parts.length > 0"
              :bordered="false"
              class="info-card">
              <template #title>
                <div style="display: flex; align-items: center; gap: 8px">
                  <AppstoreOutlined />
                  <span>{{ $t('offers.parts') || 'Parts' }}</span>
                  <a-badge
                    :count="offer.parts.length"
                    :number-style="{
                      backgroundColor: '#1890ff',
                    }" />
                </div>
              </template>

              <div class="items-table">
                <div class="table-header">
                  <div class="col-name">
                    {{ $t('offers.item') || 'Item' }}
                  </div>
                  <div class="col-quantity">
                    {{ $t('offers.quantity') || 'Qty' }}
                  </div>
                  <div class="col-price">
                    {{ $t('offers.unitPrice') || 'Unit Price' }}
                  </div>
                  <div class="col-total">
                    {{ $t('offers.total') || 'Total' }}
                  </div>
                </div>
                <div class="table-body">
                  <div v-for="part in offer.parts" :key="part.id" class="table-row">
                    <div class="col-name">
                      {{ part.name }}
                    </div>
                    <div class="col-quantity">
                      {{ part.quantity }}
                    </div>
                    <div class="col-price">€{{ Number(part.price).toFixed(2) }}</div>
                    <div class="col-total">€{{ (part.price * part.quantity).toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </a-card>

            <!-- Services -->
            <a-card
              v-if="offer.services && offer.services.length > 0"
              :bordered="false"
              class="info-card">
              <template #title>
                <div style="display: flex; align-items: center; gap: 8px">
                  <ToolOutlined />
                  <span>{{ $t('offers.services') || 'Services' }}</span>
                  <a-badge
                    :count="offer.services.length"
                    :number-style="{
                      backgroundColor: '#52c41a',
                    }" />
                </div>
              </template>

              <div class="items-table">
                <div class="table-header">
                  <div class="col-name-service">
                    {{ $t('offers.service') || 'Service' }}
                  </div>
                  <div class="col-price">
                    {{ $t('offers.price') || 'Price' }}
                  </div>
                </div>
                <div class="table-body">
                  <div v-for="service in offer.services" :key="service.id" class="table-row">
                    <div class="col-name-service">
                      {{ service.name }}
                    </div>
                    <div class="col-price">€{{ Number(service.price).toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <!-- Right Column -->
          <a-col :xs="24" :lg="8">
            <!-- Client Information -->
            <a-card
              :bordered="false"
              class="info-card"
              :title="$t('offers.clientInfo') || 'Client Information'">
              <div v-if="offer.client" class="client-card" @click="handleClientClick">
                <UserOutlined class="client-icon" />
                <div class="client-details">
                  <h3 class="client-name">
                    {{ offer.client.name }}
                  </h3>
                </div>
                <ArrowLeftOutlined class="client-arrow" style="transform: rotate(180deg)" />
              </div>
            </a-card>

            <!-- Cost Breakdown -->
            <a-card
              :bordered="false"
              class="info-card"
              :title="$t('offers.costBreakdown') || 'Cost Breakdown'">
              <div class="cost-list">
                <div class="cost-item">
                  <span class="cost-label">{{ $t('offers.partsTotal') || 'Parts Total' }}</span>
                  <span class="cost-value">
                    €{{
                      (offer.parts || [])
                        .reduce((sum, p) => sum + p.price * p.quantity, 0)
                        .toFixed(2)
                    }}
                  </span>
                </div>
                <div class="cost-item">
                  <span class="cost-label">{{
                    $t('offers.servicesTotal') || 'Services Total'
                  }}</span>
                  <span class="cost-value">
                    €{{ (offer.services || []).reduce((sum, s) => sum + s.price, 0).toFixed(2) }}
                  </span>
                </div>
                <div class="cost-item">
                  <span class="cost-label">{{ $t('offers.laborCost') || 'Labor Cost' }}</span>
                  <span class="cost-value">€{{ Number(offer.labor_cost || 0).toFixed(2) }}</span>
                </div>
                <a-divider style="margin: 16px 0" />
                <div class="cost-item total">
                  <span class="cost-label">{{ $t('offers.totalAmount') || 'Total Amount' }}</span>
                  <span class="cost-value">€{{ calculateTotal().toFixed(2) }}</span>
                </div>
              </div>
            </a-card>

            <!-- Timeline -->
            <a-card
              :bordered="false"
              class="info-card"
              :title="$t('offers.timeline') || 'Timeline'">
              <div class="timeline-list">
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">
                      {{ $t('offers.created') || 'Created' }}
                    </div>
                    <div class="timeline-date">
                      {{ dayjs(offer.created_at).format('MMM DD, YYYY HH:mm') }}
                    </div>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">
                      {{ $t('offers.lastUpdated') || 'Last Updated' }}
                    </div>
                    <div class="timeline-date">
                      {{ dayjs(offer.updated_at).format('MMM DD, YYYY HH:mm') }}
                    </div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>
</template>

<style scoped lang="scss">
  .offer-details-container {
    min-height: 100vh;
  }

  .offer-details {
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

  .offer-title-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-icon {
      font-size: 32px;
      color: #1890ff;
    }
  }

  .offer-title {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin: 0;
    line-height: 1.2;
  }

  .offer-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;

    .status-tag {
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      display: flex;
      align-items: center;
    }

    .date-text {
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

  .info-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;

    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 20px;

      .ant-card-head-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }
    }

    :deep(.ant-card-body) {
      padding: 20px;
    }
  }

  .description-text {
    color: #595959;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }

  .items-table {
    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 16px;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 8px;
      font-weight: 600;
      color: #262626;
      font-size: 13px;
      margin-bottom: 8px;

      &.service-header {
        grid-template-columns: 2fr 1fr;
      }
    }

    .table-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 16px;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 6px;
      align-items: center;
      transition: all 0.2s ease;

      &:hover {
        background: #f0f5ff;
      }

      &.service-row {
        grid-template-columns: 2fr 1fr;
      }
    }

    .col-name,
    .col-name-service {
      color: #262626;
      font-weight: 500;
    }

    .col-quantity,
    .col-price,
    .col-total {
      text-align: right;
      color: #595959;
      font-weight: 500;
    }

    .col-total {
      color: #52c41a;
      font-weight: 600;
    }
  }

  .client-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f5ff;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
    }

    .client-icon {
      font-size: 20px;
      color: #1890ff;
    }

    .client-details {
      flex: 1;

      .client-name {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin: 0;
      }
    }

    .client-arrow {
      color: #8c8c8c;
      font-size: 14px;
    }
  }

  .client-actions {
    display: flex;
    gap: 12px;
  }

  .cost-list {
    .cost-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &.total {
        padding: 16px 0;
        border-top: 2px solid #1890ff;
        border-bottom: none;
        margin-top: 8px;

        .cost-label {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }

        .cost-value {
          font-size: 20px;
          font-weight: 700;
          color: #1890ff;
        }
      }

      .cost-label {
        color: #595959;
        font-size: 14px;
      }

      .cost-value {
        color: #262626;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }

  .timeline-list {
    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;

      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }

      .timeline-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #1890ff;
        margin-top: 6px;
        flex-shrink: 0;
      }

      .timeline-content {
        flex: 1;

        .timeline-title {
          font-size: 14px;
          font-weight: 500;
          color: #262626;
          margin-bottom: 4px;
        }

        .timeline-date {
          font-size: 13px;
          color: #8c8c8c;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .header-left {
      width: 100%;
    }

    .items-table {
      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
        text-align: left;

        .col-quantity,
        .col-price,
        .col-total {
          text-align: left;
        }
      }
    }

    .client-card {
      padding: 12px;
    }
  }
</style>
