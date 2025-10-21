<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useGlobalState } from "@/composables/useGlobalState";
import { useQuery } from "@tanstack/vue-query";
import { supabase } from "@/utils/supabaseClient";
import {
    PlusOutlined,
    UserAddOutlined,
    CarOutlined,
    CheckCircleOutlined,
    TeamOutlined,
    DollarOutlined,
    ArrowUpOutlined,
    ArrowRightOutlined,
    EyeOutlined,
    EditOutlined,
    ClockCircleOutlined,
    RightOutlined,
    LineChartOutlined,
    ToolOutlined,
    FileTextOutlined,
    BellOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import type { Repair } from "@/api/repairs/interfaces";
import type { Client } from "@/api/clients/interfaces";
import type { Vehicle } from "@/api/vehicles/interfaces";
import { useClientsQuery } from "@/api/clients/queries";
import { useRepairsQuery } from "@/api/repairs/queries";

const { t } = useI18n();
const router = useRouter();
const { user } = useGlobalState();
const chartPeriod = ref("month");

const userName = computed(() => {
    return (
        user.value?.user_metadata?.full_name ||
        user.value?.email?.split("@")[0] ||
        "User"
    );
});

interface RecentRepair extends Repair {
    vehicle: Pick<Vehicle, "make" | "model" | "license_plate"> & {
        client: Pick<Client, "name">;
    };
}

const recentRepairsQuery = useQuery<RecentRepair[]>({
    queryKey: ["recentRepairs"],
    queryFn: async () => {
        const { data, error } = await supabase
            .from("repairs")
            .select(
                `
        *,
        vehicle:vehicles (
          make,
          model,
          license_plate,
          client:clients (name)
        )
      `
            )
            .order("date", { ascending: false })
            .limit(4);
        if (error) throw error;
        return data ?? [];
    },
});

const repairsQuery = useRepairsQuery();
const clientsQuery = useClientsQuery();

const getStatus = (repair: RecentRepair | Repair) => {
    if ((repair as any).status) return (repair as any).status as string;
    const repairDate = dayjs(repair.date);
    const now = dayjs();
    if (repairDate.isBefore(now) && repair.total_cost) return "completed";
    if (repairDate.isBefore(now)) return "in_progress";
    return "pending";
};

const recentRepairs = computed(() => {
    return (
        recentRepairsQuery.data.value?.map((repair) => ({
            key: repair.id,
            id: repair.id,
            vehicle:
                `${repair.vehicle?.make || ""} ${repair.vehicle?.model || ""}`.trim() ||
                "Unknown Vehicle",
            plate: repair.vehicle?.license_plate || "",
            client: repair.vehicle?.client?.name || "Unknown Client",
            status: getStatus(repair),
            priority: (repair as any).priority || "low",
            date: dayjs(repair.date).format("YYYY-MM-DD"),
        })) || []
    );
});

const activeRepairs = computed(() => {
    return (
        repairsQuery.data.value?.filter((r) => getStatus(r) === "in_progress")
            .length ?? 0
    );
});

const completedToday = computed(() => {
    const today = dayjs();
    return (
        repairsQuery.data.value?.filter(
            (r) => dayjs(r.date).isSame(today, "day") && r.total_cost
        ).length ?? 0
    );
});

const totalClients = computed(() => clientsQuery.data.value?.length ?? 0);

const thisMonthRevenue = computed(() => {
    const start = dayjs().startOf("month");
    const end = dayjs().endOf("month");
    return (
        repairsQuery.data.value
            ?.filter(
                (r) =>
                    dayjs(r.date).isAfter(start.subtract(1, "day")) &&
                    dayjs(r.date).isBefore(end)
            )
            .reduce((sum, r) => sum + (r.total_cost || 0), 0) ?? 0
    );
});

const revenueFormatted = computed(() => {
    const revenue = thisMonthRevenue.value;
    if (revenue >= 10000) {
        return `€${(revenue / 1000).toFixed(1)}K`;
    }
    return `€${revenue.toFixed(0)}`;
});

const repairColumns = [
    {
        title: t("dashboard.vehicle"),
        key: "vehicle",
        dataIndex: "vehicle",
    },
    {
        title: t("dashboard.client"),
        dataIndex: "client",
        key: "client",
    },
    {
        title: t("dashboard.status"),
        key: "status",
        dataIndex: "status",
    },
    {
        title: t("dashboard.priority"),
        key: "priority",
        dataIndex: "priority",
    },
    {
        title: t("dashboard.date"),
        dataIndex: "date",
        key: "date",
    },
    {
        title: t("dashboard.actions"),
        key: "actions",
    },
];

const pendingTasks = ref([
    {
        id: 1,
        title: "Oil change - BMW X5",
        time: "2 hours ago",
        icon: ToolOutlined,
        color: "#1890ff",
    },
    {
        id: 2,
        title: "Brake inspection - Mercedes",
        time: "4 hours ago",
        icon: CarOutlined,
        color: "#52c41a",
    },
    {
        id: 3,
        title: "Follow-up call - Иван Петров",
        time: "1 day ago",
        icon: BellOutlined,
        color: "#faad14",
    },
    {
        id: 4,
        title: "Invoice #1234",
        time: "2 days ago",
        icon: FileTextOutlined,
        color: "#722ed1",
    },
]);

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        in_progress: "processing",
        pending: "warning",
        completed: "success",
        canceled: "error",
    };
    return colors[status] || "default";
};

const getPriorityStatus = (priority: string) => {
    const statuses: Record<string, any> = {
        high: "error",
        medium: "warning",
        low: "default",
        urgent: "error",
    };
    return statuses[priority] || "default";
};

const viewRepair = (id: string) => {
    router.push(`/repairs/${id}`);
};

const editRepair = (id: string) => {
    router.push(`/repairs/${id}/edit`);
};
</script>

<template>
    <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-section">
            <div class="welcome-content">
                <h1 class="welcome-title">
                    {{ $t("dashboard.welcome") }}, {{ userName }}! 👋
                </h1>
                <p class="welcome-subtitle">
                    {{ $t("dashboard.todayOverview") }}
                </p>
            </div>
            <div class="quick-actions">
                <router-link to="/repairs/new">
                    <a-button type="primary" size="large">
                        <template #icon><PlusOutlined /></template>
                        {{ $t("dashboard.newRepair") }}
                    </a-button>
                </router-link>

                <router-link to="/clients/new">
                    <a-button size="large">
                        <template #icon><UserAddOutlined /></template>
                        {{ $t("dashboard.newClient") }}
                    </a-button>
                </router-link>
            </div>
        </div>

        <!-- Stats Cards -->
        <a-row :gutter="[16, 16]" class="stats-row">
            <a-col :xs="24" :sm="12" :lg="6">
                <a-card class="stat-card stat-card-blue" :bordered="false">
                    <div class="stat-content">
                        <div class="stat-icon">
                            <CarOutlined />
                        </div>
                        <div class="stat-info">
                            <p class="stat-label">
                                {{ $t("dashboard.activeRepairs") }}
                            </p>
                            <h2 class="stat-value">{{ activeRepairs }}</h2>
                            <div class="stat-trend positive">
                                <ArrowUpOutlined />
                                <span
                                    >12%
                                    {{ $t("dashboard.fromLastWeek") }}</span
                                >
                            </div>
                        </div>
                    </div>
                </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :lg="6">
                <a-card class="stat-card stat-card-green" :bordered="false">
                    <div class="stat-content">
                        <div class="stat-icon">
                            <CheckCircleOutlined />
                        </div>
                        <div class="stat-info">
                            <p class="stat-label">
                                {{ $t("dashboard.completedToday") }}
                            </p>
                            <h2 class="stat-value">{{ completedToday }}</h2>
                            <div class="stat-trend positive">
                                <ArrowUpOutlined />
                                <span
                                    >8% {{ $t("dashboard.fromLastWeek") }}</span
                                >
                            </div>
                        </div>
                    </div>
                </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :lg="6">
                <router-link to="/clients">
                    <a-card
                        class="stat-card stat-card-orange"
                        :bordered="false">
                        <div class="stat-content">
                            <div class="stat-icon">
                                <TeamOutlined />
                            </div>
                            <div class="stat-info">
                                <p class="stat-label">
                                    {{ $t("dashboard.totalClients") }}
                                </p>
                                <h2 class="stat-value">{{ totalClients }}</h2>
                                <div class="stat-trend positive">
                                    <ArrowUpOutlined />
                                    <span
                                        >5%
                                        {{
                                            $t("dashboard.fromLastMonth")
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>
                    </a-card>
                </router-link>
            </a-col>

            <a-col :xs="24" :sm="12" :lg="6">
                <a-card class="stat-card stat-card-purple" :bordered="false">
                    <div class="stat-content">
                        <div class="stat-icon">
                            <DollarOutlined />
                        </div>
                        <div class="stat-info">
                            <p class="stat-label">
                                {{ $t("dashboard.revenue") }}
                            </p>
                            <h2 class="stat-value">{{ revenueFormatted }}</h2>
                            <div class="stat-trend positive">
                                <ArrowUpOutlined />
                                <span
                                    >15%
                                    {{ $t("dashboard.fromLastMonth") }}</span
                                >
                            </div>
                        </div>
                    </div>
                </a-card>
            </a-col>
        </a-row>

        <!-- Main Content Grid -->
        <a-row :gutter="[16, 16]" class="content-row">
            <!-- Recent Repairs -->
            <a-col :xs="24" :lg="16">
                <a-card
                    :title="$t('dashboard.recentRepairs')"
                    :bordered="false"
                    class="content-card"
                    :loading="recentRepairsQuery.isLoading.value">
                    <template #extra>
                        <a-button type="link" @click="router.push('/repairs')">
                            {{ $t("dashboard.viewAll") }}
                            <ArrowRightOutlined />
                        </a-button>
                    </template>

                    <a-table
                        :columns="repairColumns"
                        :data-source="recentRepairs"
                        :pagination="false"
                        class="modern-table">
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'vehicle'">
                                <div class="vehicle-info">
                                    <strong>{{ record.vehicle }}</strong>
                                    <span class="vehicle-plate">{{
                                        record.plate
                                    }}</span>
                                </div>
                            </template>

                            <template v-else-if="column.key === 'status'">
                                <a-tag
                                    :color="getStatusColor(record.status)"
                                    class="status-tag">
                                    {{ $t(`status.${record.status}`) }}
                                </a-tag>
                            </template>

                            <template v-else-if="column.key === 'priority'">
                                <a-badge
                                    :status="getPriorityStatus(record.priority)"
                                    :text="$t(record.priority)" />
                            </template>

                            <template v-else-if="column.key === 'actions'">
                                <a-space>
                                    <a-button
                                        type="link"
                                        size="small"
                                        @click="viewRepair(record.id)">
                                        <EyeOutlined />
                                    </a-button>
                                    <a-button
                                        type="link"
                                        size="small"
                                        @click="editRepair(record.id)">
                                        <EditOutlined />
                                    </a-button>
                                </a-space>
                            </template>
                        </template>
                    </a-table>
                </a-card>
            </a-col>

            <!-- Quick Stats & Calendar -->
            <a-col :xs="24" :lg="8">
                <!-- Pending Tasks -->
                <a-card
                    :title="$t('dashboard.pendingTasks')"
                    :bordered="false"
                    class="content-card pending-tasks-card">
                    <a-list :data-source="pendingTasks" class="task-list">
                        <template #renderItem="{ item }">
                            <a-list-item>
                                <a-list-item-meta>
                                    <template #avatar>
                                        <a-avatar
                                            :style="{
                                                backgroundColor: item.color,
                                            }">
                                            <component :is="item.icon" />
                                        </a-avatar>
                                    </template>
                                    <template #title>
                                        <div class="task-title">
                                            {{ item.title }}
                                        </div>
                                    </template>
                                    <template #description>
                                        <div class="task-time">
                                            <ClockCircleOutlined />
                                            {{ item.time }}
                                        </div>
                                    </template>
                                </a-list-item-meta>
                                <template #actions>
                                    <a-button
                                        type="text"
                                        size="small"
                                        shape="circle">
                                        <RightOutlined />
                                    </a-button>
                                </template>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-card>
            </a-col>
        </a-row>

        <!-- Revenue Chart -->
        <a-row :gutter="[16, 16]">
            <a-col :xs="24">
                <a-card
                    :title="$t('dashboard.revenueOverview')"
                    :bordered="false"
                    class="content-card chart-card">
                    <template #extra>
                        <a-radio-group
                            v-model:value="chartPeriod"
                            button-style="solid"
                            size="small">
                            <a-radio-button value="week">{{
                                $t("dashboard.week")
                            }}</a-radio-button>
                            <a-radio-button value="month">{{
                                $t("dashboard.month")
                            }}</a-radio-button>
                            <a-radio-button value="year">{{
                                $t("dashboard.year")
                            }}</a-radio-button>
                        </a-radio-group>
                    </template>

                    <div class="chart-container">
                        <div class="chart-placeholder">
                            <LineChartOutlined
                                style="font-size: 48px; color: #d9d9d9" />
                            <p style="color: #999; margin-top: 16px">
                                {{ $t("dashboard.chartPlaceholder") }}
                            </p>
                        </div>
                    </div>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<style scoped lang="scss">
.dashboard-container {
    padding: 24px 0;
    background: #f0f2f5;
    min-height: calc(100vh - 64px);
}

.welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.welcome-content {
    .welcome-title {
        font-size: 28px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #1f1f1f;
    }

    .welcome-subtitle {
        font-size: 14px;
        color: #8c8c8c;
        margin: 0;
    }
}

.quick-actions {
    display: flex;
    gap: 12px;
}

// Stats Cards
.stats-row {
    margin-bottom: 24px;
}

.stat-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    :deep(.ant-card-body) {
        padding: 20px;
    }
}

.stat-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    flex-shrink: 0;
}

.stat-card-blue .stat-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-green .stat-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card-orange .stat-icon {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card-purple .stat-icon {
    background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.stat-info {
    flex: 1;
}

.stat-label {
    font-size: 14px;
    color: #8c8c8c;
    margin: 0 0 8px 0;
    font-weight: 500;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1f1f1f;
}

.stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;

    &.positive {
        color: #52c41a;
    }

    &.negative {
        color: #ff4d4f;
    }
}

// Content Cards
.content-row {
    margin-bottom: 24px;
}

.content-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    height: 100%;

    :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 24px;

        .ant-card-head-title {
            font-size: 16px;
            font-weight: 600;
        }
    }

    :deep(.ant-card-body) {
        padding: 24px;
    }
}

// Table Styles
.modern-table {
    :deep(.ant-table) {
        background: transparent;
    }

    :deep(.ant-table-thead > tr > th) {
        background: #fafafa;
        font-weight: 600;
        border-bottom: 2px solid #f0f0f0;
    }

    :deep(.ant-table-tbody > tr) {
        transition: all 0.3s;

        &:hover > td {
            background: #fafafa;
        }
    }
}

.vehicle-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
        color: #1f1f1f;
        font-size: 14px;
    }

    .vehicle-plate {
        font-size: 12px;
        color: #8c8c8c;
        font-family: monospace;
    }
}

.status-tag {
    border-radius: 6px;
    font-weight: 500;
    padding: 2px 10px;
}

// Tasks List
.pending-tasks-card {
    :deep(.ant-card-body) {
        padding: 0;
    }
}

.task-list {
    :deep(.ant-list-item) {
        padding: 16px 24px;
        border-bottom: 1px solid #f0f0f0;
        transition: all 0.3s;

        &:hover {
            background: #fafafa;
        }

        &:last-child {
            border-bottom: none;
        }
    }
}

.task-title {
    font-size: 14px;
    font-weight: 500;
    color: #1f1f1f;
}

.task-time {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #8c8c8c;
}

// Calendar
.calendar-card {
    :deep(.ant-picker-calendar) {
        .ant-picker-panel {
            border: none;
        }

        .ant-picker-calendar-header {
            padding: 8px 0;
        }

        .ant-picker-cell-in-view.ant-picker-cell-selected
            .ant-picker-cell-inner {
            background: #1890ff;
            color: white;
        }
    }
}

.calendar-cell {
    position: relative;
    height: 100%;
}

.appointment-dot {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #1890ff;
}

// Chart
.chart-card {
    .chart-container {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        border-radius: 8px;
    }

    .chart-placeholder {
        text-align: center;
    }
}

// Responsive
@media (max-width: 768px) {
    .dashboard-container {
        padding: 16px;
    }

    .welcome-section {
        flex-direction: column;
        align-items: flex-start;
    }

    .quick-actions {
        width: 100%;

        button {
            flex: 1;
        }
    }

    .welcome-content .welcome-title {
        font-size: 22px;
    }
}
</style>
