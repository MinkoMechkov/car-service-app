<script setup lang="ts">
import { computed, h } from "vue";
import { useI18n } from "vue-i18n";
import { useClientPendingOffers } from "@/api/offers/queries";
import { useRespondToOffer } from "@/api/offers/mutations";
import { message, Modal } from "ant-design-vue";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";

const { t } = useI18n();

const { user, role, userId } = useGlobalState();

useOffersRealtimeSync(userId.value, role.value);

// Get current client ID
const currentClientId = computed<string | null>(() => user.value?.id ?? null);

const offersQuery = useClientPendingOffers(currentClientId.value);
const respondMutation = useRespondToOffer();

const handleAccept = (offerId: string, title: string) => {
    Modal.confirm({
        title: t("offers.confirmAccept") || "Accept Offer",
        icon: h(CheckCircleOutlined, { style: { color: "#52c41a" } }),
        content:
            t("offers.confirmAcceptMessage", { title }) ||
            `Are you sure you want to accept the offer "${title}"?`,
        okText: t("offers.accept"),
        okType: "primary",
        cancelText: t("common.cancel"),
        onOk: async () => {
            try {
                await respondMutation.mutateAsync({
                    offerId,
                    response: "accepted",
                });
                offersQuery.refetch();
                message.success(
                    t("offers.acceptSuccess") || "Offer accepted successfully"
                );
            } catch (error) {
                message.error(
                    t("offers.acceptError") || "Failed to accept offer"
                );
            }
        },
    });
};

const handleDecline = (offerId: string, title: string) => {
    Modal.confirm({
        title: t("offers.confirmDecline") || "Decline Offer",
        icon: h(ExclamationCircleOutlined, { style: { color: "#ff4d4f" } }),
        content:
            t("offers.confirmDeclineMessage", { title }) ||
            `Are you sure you want to decline the offer "${title}"?`,
        okText: t("offers.decline"),
        okType: "danger",
        cancelText: t("common.cancel"),
        onOk: async () => {
            try {
                await respondMutation.mutateAsync({
                    offerId,
                    response: "declined",
                });
                offersQuery.refetch();
                message.success(t("offers.declineSuccess") || "Offer declined");
            } catch (error) {
                message.error(
                    t("offers.declineError") || "Failed to decline offer"
                );
            }
        },
    });
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
    <div class="pending-offers-container">
        <a-card :bordered="false" class="offers-card">
            <template #title>
                <div class="card-header">
                    <span class="card-title">{{
                        $t("offers.pendingOffers") || "Pending Offers"
                    }}</span>
                    <a-badge
                        :count="offersQuery.data.value?.length || 0"
                        :number-style="{ backgroundColor: '#faad14' }" />
                </div>
            </template>

            <a-spin :spinning="offersQuery.isLoading.value">
                <div
                    v-if="
                        offersQuery.data.value &&
                        offersQuery.data.value.length > 0
                    "
                    class="offers-grid">
                    <a-card
                        v-for="offer in offersQuery.data.value"
                        :key="offer.id"
                        class="offer-card"
                        :bordered="false">
                        <div class="offer-header">
                            <div class="offer-title-section">
                                <FileTextOutlined class="offer-icon" />
                                <div>
                                    <h3 class="offer-title">
                                        {{ offer.title }}
                                    </h3>
                                    <span class="offer-date">{{
                                        dayjs(offer.created_at).format(
                                            "MMM DD, YYYY"
                                        )
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <a-divider style="margin: 16px 0" />

                        <div v-if="offer.description" class="offer-description">
                            {{ offer.description }}
                        </div>

                        <!-- Parts -->
                        <div
                            v-if="offer.parts && offer.parts.length > 0"
                            class="offer-section">
                            <h4 class="section-title">
                                {{ $t("offers.parts") || "Parts" }}
                            </h4>
                            <div class="items-list">
                                <div
                                    v-for="part in offer.parts"
                                    :key="part.id"
                                    class="item-row">
                                    <span class="item-name">{{
                                        part.name
                                    }}</span>
                                    <span class="item-quantity"
                                        >x{{ part.quantity }}</span
                                    >
                                    <span class="item-price"
                                        >€{{
                                            (
                                                part.price * part.quantity
                                            ).toFixed(2)
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Services -->
                        <div
                            v-if="offer.services && offer.services.length > 0"
                            class="offer-section">
                            <h4 class="section-title">
                                {{ $t("offers.services") || "Services" }}
                            </h4>
                            <div class="items-list">
                                <div
                                    v-for="service in offer.services"
                                    :key="service.id"
                                    class="item-row">
                                    <span class="item-name">{{
                                        service.name
                                    }}</span>
                                    <span class="item-price"
                                        >€{{
                                            Number(service.price).toFixed(2)
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Labor Cost -->
                        <div
                            v-if="offer.labor_cost && offer.labor_cost > 0"
                            class="offer-section">
                            <div class="item-row">
                                <span class="item-name">{{
                                    $t("offers.laborCost") || "Labor Cost"
                                }}</span>
                                <span class="item-price"
                                    >€{{
                                        Number(offer.labor_cost).toFixed(2)
                                    }}</span
                                >
                            </div>
                        </div>

                        <a-divider style="margin: 16px 0" />

                        <div class="offer-total">
                            <span class="total-label">{{
                                $t("offers.total") || "Total"
                            }}</span>
                            <span class="total-amount"
                                >€{{ calculateTotal(offer).toFixed(2) }}</span
                            >
                        </div>

                        <div class="offer-actions">
                            <a-button
                                type="primary"
                                size="large"
                                @click="handleAccept(offer.id, offer.title)"
                                :loading="respondMutation.isPending.value">
                                <template #icon
                                    ><CheckCircleOutlined
                                /></template>
                                {{ $t("offers.accept") || "Accept" }}
                            </a-button>
                            <a-button
                                danger
                                size="large"
                                @click="handleDecline(offer.id, offer.title)"
                                :loading="respondMutation.isPending.value">
                                <template #icon
                                    ><CloseCircleOutlined
                                /></template>
                                {{ $t("offers.decline") || "Decline" }}
                            </a-button>
                        </div>
                    </a-card>
                </div>

                <a-empty
                    v-else
                    :description="
                        $t('offers.noPendingOffers') || 'No pending offers'
                    "
                    style="padding: 60px 0" />
            </a-spin>
        </a-card>
    </div>
</template>

<style scoped lang="scss">
.pending-offers-container {
    min-height: 100vh;
}

.offers-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
        padding: 20px 24px;
    }

    :deep(.ant-card-body) {
        padding: 24px;
    }
}

.card-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .card-title {
        font-size: 20px;
        font-weight: 600;
        color: #262626;
    }
}

.offers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
}

.offer-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 2px solid #f0f0f0;
    transition: all 0.3s ease;

    &:hover {
        border-color: #1890ff;
        box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
        transform: translateY(-2px);
    }

    :deep(.ant-card-body) {
        padding: 24px;
    }
}

.offer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.offer-title-section {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .offer-icon {
        font-size: 24px;
        color: #1890ff;
        margin-top: 4px;
    }
}

.offer-title {
    font-size: 18px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 4px 0;
    line-height: 1.3;
}

.offer-date {
    font-size: 13px;
    color: #8c8c8c;
}

.offer-description {
    padding: 12px 16px;
    background: #fafafa;
    border-radius: 8px;
    color: #595959;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
}

.offer-section {
    margin-bottom: 16px;

    .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #262626;
        margin: 0 0 12px 0;
    }
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #fafafa;
    border-radius: 6px;

    .item-name {
        flex: 1;
        color: #595959;
        font-size: 14px;
    }

    .item-quantity {
        color: #8c8c8c;
        font-size: 13px;
    }

    .item-price {
        font-weight: 600;
        color: #262626;
        font-size: 14px;
        min-width: 80px;
        text-align: right;
    }
}

.offer-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
    border-radius: 8px;
    margin-bottom: 20px;

    .total-label {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
    }

    .total-amount {
        font-size: 24px;
        font-weight: 700;
        color: #1890ff;
    }
}

.offer-actions {
    display: flex;
    gap: 12px;

    .ant-btn {
        flex: 1;
        border-radius: 8px;
        height: 44px;
        font-weight: 500;

        &.ant-btn-primary {
            box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);

            &:hover {
                box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
            }
        }

        &.ant-btn-dangerous {
            box-shadow: 0 2px 4px rgba(255, 77, 79, 0.2);

            &:hover {
                box-shadow: 0 4px 8px rgba(255, 77, 79, 0.3);
            }
        }

        transition: all 0.3s ease;
    }
}

@media (max-width: 768px) {
    .offers-grid {
        grid-template-columns: 1fr;
    }
}
</style>
