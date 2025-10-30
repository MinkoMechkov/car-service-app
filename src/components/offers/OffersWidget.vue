<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
    useAdminOffersList,
    useClientPendingOffers,
} from "@/api/offers/queries";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { t } = useI18n();

const router = useRouter();

const { userId, role , isAdmin} = useGlobalState();

useOffersRealtimeSync(userId.value, role.value);

// Admin: fetch all offers, Client: fetch only pending offers for this client
const adminOffersQuery = useAdminOffersList(userId.value);
const clientOffersQuery = useClientPendingOffers(userId.value);

// Use appropriate query based on role
const offersQuery = computed(() =>
    isAdmin.value ? adminOffersQuery : clientOffersQuery
);

const offers = computed(() => offersQuery.value.data.value || []);

// Calculate metrics (Admin only)
const metrics = computed(() => {
    if (!isAdmin.value)
        return { pending: offers.value.length, accepted: 0, declined: 0 };

    const pending = offers.value.filter((o) => o.status === "pending").length;
    const accepted = offers.value.filter((o) => o.status === "accepted").length;
    const declined = offers.value.filter((o) => o.status === "declined").length;

    return { pending, accepted, declined };
});

// Get recent offers (last 5 for admin, all for client)
const recentOffers = computed(() =>
    isAdmin.value ? offers.value.slice(0, 5) : offers.value
);

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        pending: "warning",
        accepted: "success",
        declined: "error",
    };
    return colors[status] || "default";
};

const handleViewOffer = (offerId: string) => {
    router.push(`/offers/${offerId}`);
};

const handleViewAll = () => {
    router.push(isAdmin.value ? "/offers" : "/pending-offers");
};

const calculateTotal = (offer: any) => {
    const partsTotal = (offer.parts || []).reduce(
        (sum: number, part: any) => sum + part.price * part.quantity,
        0
    );
    const servicesTotal = (offer.services || []).reduce(
        (sum: number, service: any) => sum + service.price,
        0
    );
    return partsTotal + servicesTotal + (offer.labor_cost || 0);
};
</script>

<template>
    <a-card
        :bordered="false"
        class="offers-widget"
        :loading="offersQuery.isLoading.value">
        <template #title>
            <div class="widget-header">
                <div class="header-left">
                    <FileTextOutlined class="header-icon" />
                    <span>{{
                        isAdmin
                            ? $t("dashboard.offers") || "Offers"
                            : $t("offers.pendingOffers") || "Pending Offers"
                    }}</span>
                </div>
                <a-button type="link" size="small" @click="handleViewAll">
                    {{ $t("common.viewAll") || "View All" }}
                    <ArrowRightOutlined style="margin-left: 4px" />
                </a-button>
            </div>
        </template>

        <!-- Metrics (Admin only) -->
        <div v-if="isAdmin" class="metrics-grid">
            <div class="metric-card pending">
                <div class="metric-icon">
                    <ClockCircleOutlined />
                </div>
                <div class="metric-content">
                    <div class="metric-value">{{ metrics.pending }}</div>
                    <div class="metric-label">
                        {{ $t("offers.pending") || "Pending" }}
                    </div>
                </div>
            </div>

            <div class="metric-card accepted">
                <div class="metric-icon">
                    <CheckCircleOutlined />
                </div>
                <div class="metric-content">
                    <div class="metric-value">{{ metrics.accepted }}</div>
                    <div class="metric-label">
                        {{ $t("offers.accepted") || "Accepted" }}
                    </div>
                </div>
            </div>

            <div class="metric-card declined">
                <div class="metric-icon">
                    <CloseCircleOutlined />
                </div>
                <div class="metric-content">
                    <div class="metric-value">{{ metrics.declined }}</div>
                    <div class="metric-label">
                        {{ $t("offers.declined") || "Declined" }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Client: Pending Count Badge -->
        <div v-else class="client-pending-count">
            <a-alert
                :message="`${metrics.pending} ${$t('offers.pendingOffersWaiting') || 'pending offer(s) waiting for your response'}`"
                type="warning"
                show-icon
                :icon="h(ClockCircleOutlined)" />
        </div>

        <!-- Recent Offers List -->
        <div v-if="recentOffers.length > 0" class="recent-offers">
            <h4 v-if="isAdmin" class="section-title">
                {{ $t("dashboard.recentOffers") || "Recent Offers" }}
            </h4>

            <div class="offers-list">
                <div
                    v-for="offer in recentOffers"
                    :key="offer.id"
                    class="offer-item"
                    @click="handleViewOffer(offer.id)">
                    <div class="offer-main">
                        <div class="offer-info">
                            <div class="offer-title">{{ offer.title }}</div>
                            <div class="offer-client" v-if="isAdmin">
                                {{ offer.client?.name || "Unknown Client" }}
                            </div>
                            <div class="offer-date" v-else>
                                {{
                                    dayjs(offer.created_at).format(
                                        "MMM DD, YYYY"
                                    )
                                }}
                            </div>
                        </div>
                        <div class="offer-meta">
                            <a-tag
                                :color="getStatusColor(offer.status)"
                                class="status-tag">
                                {{
                                    $t(
                                        `offers.status${offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}`
                                    )
                                }}
                            </a-tag>
                            <div class="offer-amount">
                                €{{ Number(calculateTotal(offer)).toFixed(2) }}
                            </div>
                        </div>
                    </div>
                    <div class="offer-footer">
                        <span class="offer-date">{{
                            dayjs(offer.created_at).fromNow()
                        }}</span>
                        <a-tooltip :title="$t('common.view')">
                            <EyeOutlined class="view-icon" />
                        </a-tooltip>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <a-empty
            v-else
            :description="
                isAdmin
                    ? $t('dashboard.noOffers') || 'No offers yet'
                    : $t('offers.noPendingOffers') || 'No pending offers'
            "
            style="padding: 40px 0">
            <a-button
                v-if="isAdmin"
                type="primary"
                @click="() => router.push('/offers/new')">
                {{ $t("offers.createFirst") || "Create Your First Offer" }}
            </a-button>
        </a-empty>
    </a-card>
</template>

<style scoped lang="scss">
.offers-widget {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    height: 100%;

    .client-pending-count {
        margin-bottom: 20px;
    }
    :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 24px;
    }

    :deep(.ant-card-body) {
        padding: 24px;
    }
}

.widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #262626;

        .header-icon {
            font-size: 18px;
            color: #1890ff;
        }
    }

    :deep(.ant-btn-link) {
        padding: 0;
        height: auto;
        font-size: 14px;

        &:hover {
            color: #40a9ff;
        }
    }
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.metric-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    &.pending {
        background: linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%);

        .metric-icon {
            background: #faad14;
            color: white;
        }
    }

    &.accepted {
        background: linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%);

        .metric-icon {
            background: #52c41a;
            color: white;
        }
    }

    &.declined {
        background: linear-gradient(135deg, #fff1f0 0%, #fff2f0 100%);

        .metric-icon {
            background: #ff4d4f;
            color: white;
        }
    }

    .metric-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }

    .metric-content {
        flex: 1;
    }

    .metric-value {
        font-size: 24px;
        font-weight: 700;
        color: #262626;
        line-height: 1;
        margin-bottom: 4px;
    }

    .metric-label {
        font-size: 13px;
        color: #8c8c8c;
        font-weight: 500;
    }
}

.recent-offers {
    .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 16px 0;
    }
}

.offers-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.offer-item {
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #f5f5f5;
        border-color: #1890ff;
        transform: translateX(4px);

        .view-icon {
            opacity: 1;
        }
    }
}

.offer-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 12px;
}

.offer-info {
    flex: 1;
    min-width: 0;
}

.offer-title {
    font-weight: 600;
    color: #262626;
    font-size: 14px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.offer-client {
    font-size: 13px;
    color: #8c8c8c;
}

.offer-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;

    .status-tag {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 500;
    }

    .offer-amount {
        font-weight: 700;
        color: #52c41a;
        font-size: 15px;
    }
}

.offer-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #e8e8e8;

    .offer-date {
        font-size: 12px;
        color: #8c8c8c;
    }

    .view-icon {
        color: #1890ff;
        font-size: 16px;
        opacity: 0;
        transition: opacity 0.2s ease;
    }
}

@media (max-width: 768px) {
    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .offer-main {
        flex-direction: column;
    }

    .offer-meta {
        flex-direction: row;
        align-items: center;
        width: 100%;
    }
}

@media (max-width: 1200px) and (min-width: 769px) {
    .metrics-grid {
        grid-template-columns: 1fr;
    }
}
</style>
