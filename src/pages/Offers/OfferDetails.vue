<script setup lang="ts">
import { computed, h } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import { message, Modal } from "ant-design-vue";
import {
    EditOutlined,
    ArrowLeftOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    ToolOutlined,
    AppstoreOutlined,
} from "@ant-design/icons-vue";
import type { Offer } from "@/api/offers/interfaces";
import dayjs from "dayjs";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const offerId = computed(() => route.params.id as string);

interface OfferWithRelations extends Offer {
    client?: {
        id: string;
        full_name: string;
    };
    admin?: {
        id: string;
        full_name: string;
    };
}

const offerQuery = useQuery<OfferWithRelations>({
    queryKey: ["offerDetails", offerId.value],
    queryFn: async () => {
        const { data, error } = await supabase
            .from("offers")
            .select(
                `
        *,
        client:clients!offers_client_id_fkey (
          id,
          name
        ),
        admin:profiles!offers_admin_id_fkey (
          id,
          full_name
        ),
        parts:offer_parts(*),
        services:offer_services(*)
      `
            )
            .eq("id", offerId.value)
            .single();
        if (error) throw error;
        return data;
    },
    enabled: !!offerId.value,
});

const offer = computed(() => offerQuery.data.value);

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        pending: "warning",
        accepted: "success",
        declined: "error",
    };
    return colors[status] || "default";
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
    router.push("/offers");
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
                                        <a-tag
                                            :color="
                                                getStatusColor(offer.status)
                                            "
                                            class="status-tag">
                                            <component
                                                :is="
                                                    getStatusIcon(offer.status)
                                                "
                                                style="margin-right: 4px" />
                                            {{
                                                $t(
                                                    `offers.status${offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}`
                                                )
                                            }}
                                        </a-tag>
                                        <span class="date-text">{{
                                            dayjs(offer.created_at).format(
                                                "MMM DD, YYYY"
                                            )
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="header-actions"
                            v-if="offer.status === 'pending'">
                            <a-button @click="handleEdit" size="large">
                                <template #icon><EditOutlined /></template>
                                {{ $t("common.edit") }}
                            </a-button>
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
                                <div
                                    style="
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                    ">
                                    <AppstoreOutlined />
                                    <span>{{
                                        $t("offers.parts") || "Parts"
                                    }}</span>
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
                                        {{ $t("offers.item") || "Item" }}
                                    </div>
                                    <div class="col-quantity">
                                        {{ $t("offers.quantity") || "Qty" }}
                                    </div>
                                    <div class="col-price">
                                        {{
                                            $t("offers.unitPrice") ||
                                            "Unit Price"
                                        }}
                                    </div>
                                    <div class="col-total">
                                        {{ $t("offers.total") || "Total" }}
                                    </div>
                                </div>
                                <div class="table-body">
                                    <div
                                        v-for="part in offer.parts"
                                        :key="part.id"
                                        class="table-row">
                                        <div class="col-name">
                                            {{ part.name }}
                                        </div>
                                        <div class="col-quantity">
                                            {{ part.quantity }}
                                        </div>
                                        <div class="col-price">
                                            €{{ Number(part.price).toFixed(2) }}
                                        </div>
                                        <div class="col-total">
                                            €{{
                                                (
                                                    part.price * part.quantity
                                                ).toFixed(2)
                                            }}
                                        </div>
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
                                <div
                                    style="
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                    ">
                                    <ToolOutlined />
                                    <span>{{
                                        $t("offers.services") || "Services"
                                    }}</span>
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
                                        {{ $t("offers.service") || "Service" }}
                                    </div>
                                    <div class="col-price">
                                        {{ $t("offers.price") || "Price" }}
                                    </div>
                                </div>
                                <div class="table-body">
                                    <div
                                        v-for="service in offer.services"
                                        :key="service.id"
                                        class="table-row">
                                        <div class="col-name-service">
                                            {{ service.name }}
                                        </div>
                                        <div class="col-price">
                                            €{{
                                                Number(service.price).toFixed(2)
                                            }}
                                        </div>
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
                            :title="
                                $t('offers.clientInfo') || 'Client Information'
                            ">
                            <div
                                v-if="offer.client"
                                class="client-card"
                                @click="handleClientClick">
                                <UserOutlined class="client-icon" />
                                <div class="client-details">
                                    <h3 class="client-name">
                                        {{ offer.client.full_name }}
                                    </h3>
                                </div>
                                <ArrowLeftOutlined
                                    class="client-arrow"
                                    style="transform: rotate(180deg)" />
                            </div>
                        </a-card>

                        <!-- Cost Breakdown -->
                        <a-card
                            :bordered="false"
                            class="info-card"
                            :title="
                                $t('offers.costBreakdown') || 'Cost Breakdown'
                            ">
                            <div class="cost-list">
                                <div class="cost-item">
                                    <span class="cost-label">{{
                                        $t("offers.partsTotal") || "Parts Total"
                                    }}</span>
                                    <span class="cost-value">
                                        €{{
                                            (offer.parts || [])
                                                .reduce(
                                                    (sum, p) =>
                                                        sum +
                                                        p.price * p.quantity,
                                                    0
                                                )
                                                .toFixed(2)
                                        }}
                                    </span>
                                </div>
                                <div class="cost-item">
                                    <span class="cost-label">{{
                                        $t("offers.servicesTotal") ||
                                        "Services Total"
                                    }}</span>
                                    <span class="cost-value">
                                        €{{
                                            (offer.services || [])
                                                .reduce(
                                                    (sum, s) => sum + s.price,
                                                    0
                                                )
                                                .toFixed(2)
                                        }}
                                    </span>
                                </div>
                                <div class="cost-item">
                                    <span class="cost-label">{{
                                        $t("offers.laborCost") || "Labor Cost"
                                    }}</span>
                                    <span class="cost-value"
                                        >€{{
                                            Number(
                                                offer.labor_cost || 0
                                            ).toFixed(2)
                                        }}</span
                                    >
                                </div>
                                <a-divider style="margin: 16px 0" />
                                <div class="cost-item total">
                                    <span class="cost-label">{{
                                        $t("offers.totalAmount") ||
                                        "Total Amount"
                                    }}</span>
                                    <span class="cost-value"
                                        >€{{
                                            calculateTotal().toFixed(2)
                                        }}</span
                                    >
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
                                            {{
                                                $t("offers.created") ||
                                                "Created"
                                            }}
                                        </div>
                                        <div class="timeline-date">
                                            {{
                                                dayjs(offer.created_at).format(
                                                    "MMM DD, YYYY HH:mm"
                                                )
                                            }}
                                        </div>
                                    </div>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-content">
                                        <div class="timeline-title">
                                            {{
                                                $t("offers.lastUpdated") ||
                                                "Last Updated"
                                            }}
                                        </div>
                                        <div class="timeline-date">
                                            {{
                                                dayjs(offer.updated_at).format(
                                                    "MMM DD, YYYY HH:mm"
                                                )
                                            }}
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
}
</style>
