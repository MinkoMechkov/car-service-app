<script setup lang="ts">
import { computed, h } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import { useAdminOffers } from "@/api/offers/queries";
import {
    EyeOutlined,
    EditOutlined,
    PlusOutlined,
    FileTextOutlined,
} from "@ant-design/icons-vue";
import { Space, Button, Tooltip, Tag } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";
import type { Offer } from "@/api/offers/interfaces";
import { useGlobalState } from "@/composables/useGlobalState";
import dayjs from "dayjs";

const { t } = useI18n();
const router = useRouter();

const { user, role } = useGlobalState();

// Get current admin ID
const currentAdminId = computed<string | null>(() => user.value?.id ?? null);

interface OfferWithClient extends Offer {
    client?: {
        name: string;
        email: string;
    };
}

const offersQuery = useQuery<OfferWithClient[]>({
    queryKey: ["adminOffersList", currentAdminId.value],
    queryFn: async () => {
        const { data, error } = await supabase
            .from("offers")
            .select(
            `
                *,
                client:clients!offers_client_id_fkey (
                id,
                name,
                email
                ),
                parts:offer_parts(*),
                services:offer_services(*)
            `
            )
            .eq("admin_id", currentAdminId.value)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as any;
    },
});

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        pending: "warning",
        accepted: "success",
        declined: "error",
    };
    return colors[status] || "default";
};

const dataSource = computed(
    () =>
        offersQuery.data.value?.map((offer) => ({
            key: offer.id,
            id: offer.id,
            title: offer.title,
            client: offer.client?.name || "Unknown Client",
            status: offer.status,
            total_amount: offer.total_amount,
            parts_count: offer.parts?.length || 0,
            services_count: offer.services?.length || 0,
            created_at: offer.created_at,
        })) || []
);

const columns: TableColumnsType = [
    {
        title: t("offers.title") || "Title",
        key: "title",
        sorter: (a: any, b: any) => a.title.localeCompare(b.title),
        customRender: ({ record }: any) =>
            h("div", { class: "offer-title-cell" }, [
                h(FileTextOutlined, {
                    style: { marginRight: "8px", color: "#1890ff" },
                }),
                h("strong", {}, record.title),
            ]),
    },
    {
        title: t("offers.client") || "Client",
        dataIndex: "client",
        key: "client",
        sorter: (a: any, b: any) => a.client.localeCompare(b.client),
    },
    {
        title: t("offers.status") || "Status",
        dataIndex: "status",
        key: "status",
        filters: [
            { text: t("offers.statusPending"), value: "pending" },
            { text: t("offers.statusAccepted"), value: "accepted" },
            { text: t("offers.statusDeclined"), value: "declined" },
        ],
        onFilter: (value: any, record: any) => record.status === value,
        customRender: ({ text }: any) =>
            h(Tag, { color: getStatusColor(text as string) }, () =>
                t(
                    `offers.status${text.charAt(0).toUpperCase() + text.slice(1)}`
                )
            ),
    },
    {
        title: t("offers.items") || "Items",
        key: "items",
        customRender: ({ record }: any) =>
            h(Space, { size: 8 }, () => [
                h(
                    Tag,
                    { color: "blue" },
                    () =>
                        `${record.parts_count} ${t("offers.parts") || "Parts"}`
                ),
                h(
                    Tag,
                    { color: "green" },
                    () =>
                        `${record.services_count} ${t("offers.services") || "Services"}`
                ),
            ]),
    },
    {
        title: t("offers.totalAmount") || "Total Amount",
        dataIndex: "total_amount",
        key: "total_amount",
        sorter: (a: any, b: any) =>
            (a.total_amount || 0) - (b.total_amount || 0),
        customRender: ({ text }: any) =>
            h(
                "span",
                { style: { fontWeight: "600", color: "#52c41a" } },
                `€${Number(text).toFixed(2)}`
            ),
    },
    {
        title: t("offers.date") || "Created",
        dataIndex: "created_at",
        key: "created_at",
        sorter: (a: any, b: any) =>
            dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
        customRender: ({ text }: any) => dayjs(text).format("MMM DD, YYYY"),
    },
    {
        title: t("common.actions") || "Actions",
        key: "actions",
        width: 120,
        align: "center",
        customRender: ({ record }: any) =>
            h(Space, { size: 4 }, () => [
                h(Tooltip, { title: t("common.view") }, () =>
                    h(Button, {
                        type: "text",
                        size: "small",
                        icon: h(EyeOutlined),
                        onClick: () => router.push(`/offers/${record.id}`),
                    })
                ),
                record.status === "pending" &&
                    h(Tooltip, { title: t("common.edit") }, () =>
                        h(Button, {
                            type: "text",
                            size: "small",
                            icon: h(EditOutlined),
                            onClick: () =>
                                router.push(`/offers/${record.id}/edit`),
                        })
                    ),
            ]),
    },
];

const handleNew = () => router.push("/offers/new");
</script>

<template>
    <div class="offers-list">
        <a-card :bordered="false" class="offers-card">
            <template #title>
                <div class="card-header">
                    <span class="card-title">{{
                        $t("offers.listTitle") || "Offers"
                    }}</span>
                    <a-button
                        type="primary"
                        @click="handleNew"
                        class="new-offer-btn">
                        <template #icon><PlusOutlined /></template>
                        {{ $t("offers.new") || "New Offer" }}
                    </a-button>
                </div>
            </template>
            <a-table
                :columns="columns"
                :data-source="dataSource"
                :loading="offersQuery.isLoading.value"
                :pagination="{
                    pageSize: 10,
                    showTotal: (total) => `Total ${total} offers`,
                }"
                :row-class-name="() => 'table-row'" />
        </a-card>
    </div>
</template>

<style scoped lang="scss">
.offers-list {
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

    .new-offer-btn {
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

.offer-title-cell {
    display: flex;
    align-items: center;
    color: #262626;
    font-weight: 500;
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

        &:hover {
            background: rgba(24, 144, 255, 0.08);
            color: #1890ff;
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
