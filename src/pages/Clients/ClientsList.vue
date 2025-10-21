<script setup lang="ts">
import { computed, h } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useClientsQuery } from "@/api/clients/queries";
import { useDeleteClientMutation } from "@/api/clients/mutations";
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons-vue";
import { Popconfirm, Space, Button, Tooltip } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";

const { t } = useI18n();
const router = useRouter();

const clientsQuery = useClientsQuery();
const deleteMutation = useDeleteClientMutation();

const dataSource = computed(() =>
    (clientsQuery.data.value || []).map((c) => ({
        key: c.id,
        id: c.id,
        name: c.name,
        phone: c.phone || "-",
        email: c.email || "-",
        address: c.address || "-",
    }))
);

const columns: TableColumnsType = [
    {
        title: t("dashboard.client"),
        dataIndex: "name",
        key: "name",
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
        title: t("auth.email"),
        dataIndex: "email",
        key: "email",
    },
    {
        title: t("clients.phone") || "Phone",
        dataIndex: "phone",
        key: "phone",
    },
    {
        title: t("clients.address") || "Address",
        dataIndex: "address",
        key: "address",
    },
    {
        title: t("dashboard.actions"),
        key: "actions",
        width: 150,
        align: "center",
        customRender: ({ record }: any) =>
            h(Space, { size: 4 }, () => [
                h(Tooltip, { title: t("common.view") }, () =>
                    h(Button, {
                        type: "text",
                        size: "small",
                        icon: h(EyeOutlined),
                        onClick: () => router.push(`/clients/${record.id}`),
                    })
                ),
                h(Tooltip, { title: t("common.edit") }, () =>
                    h(Button, {
                        type: "text",
                        size: "small",
                        icon: h(EditOutlined),
                        onClick: () =>
                            router.push(`/clients/${record.id}/edit`),
                    })
                ),
                h(
                    Popconfirm,
                    {
                        title: t("common.confirmDelete"),
                        onConfirm: () => deleteMutation.mutate(record.id),
                    },
                    {
                        default: () =>
                            h(Tooltip, { title: t("common.delete") }, () =>
                                h(Button, {
                                    type: "text",
                                    size: "small",
                                    danger: true,
                                    icon: h(DeleteOutlined),
                                })
                            ),
                    }
                ),
            ]),
    },
];

const handleNew = () => router.push("/clients/new");
</script>

<template>
    <div class="clients-list">
        <a-card :bordered="false" class="clients-card">
            <template #title>
                <div class="card-header">
                    <span class="card-title">{{
                        $t("clients.title") || "Clients"
                    }}</span>
                    <a-button
                        type="primary"
                        @click="handleNew"
                        class="new-client-btn">
                        <template #icon><PlusOutlined /></template>
                        {{ $t("clients.new") || "New Client" }}
                    </a-button>
                </div>
            </template>
            <a-table
                :columns="columns"
                :data-source="dataSource"
                :loading="clientsQuery.isLoading.value"
                :pagination="{
                    pageSize: 10,
                    showTotal: (total) => `Total ${total} clients`,
                }"
                :row-class-name="() => 'table-row'" />
        </a-card>
    </div>
</template>

<style scoped lang="scss">
.clients-list {
    min-height: 100vh;
}

.clients-card {
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

    .new-client-btn {
        border-radius: 8px;
        height: 38px;
        padding: 0 20px;
        box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
        transition: all 0.3s ease;
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

            &:first-child {
                font-weight: 500;
                color: #262626;
            }
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
}

:deep(.ant-pagination) {
    padding: 16px 16px;
    margin: 0;
}

// Loading state improvements
:deep(.ant-spin-container) {
    min-height: 400px;
}

// Empty state
:deep(.ant-empty) {
    padding: 60px 0;
}
</style>
