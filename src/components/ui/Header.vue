<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
    MenuOutlined,
    UserOutlined,
    DownOutlined,
    SettingOutlined,
    LogoutOutlined,
    BellOutlined,
    SearchOutlined,
    ToolOutlined,
} from "@ant-design/icons-vue";
import { useGlobalState } from "@/composables/useGlobalState";
import { useI18n } from "vue-i18n";
import { Grid } from "ant-design-vue";

const useBreakpoint = Grid.useBreakpoint;
const screens = useBreakpoint();

defineProps<{
    title?: string;
}>();

const emit = defineEmits<{
    (e: "toggle-menu"): void;
}>();

const { t } = useI18n();
const router = useRouter();
const { user, signOut } = useGlobalState();

const userName = computed(() => {
    return (
        user.value?.user_metadata?.full_name ||
        user.value?.email?.split("@")[0] ||
        "User"
    );
});

const userInitials = computed(() => {
    const name = userName.value;
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
});

const handleLogout = async () => {
    try {
        await signOut();
        message.success(t("auth.logoutSuccess"));
        router.push("/auth/login");
    } catch (error: any) {
        message.error(error.message || t("auth.logoutError"));
    }
};
</script>

<template>
    <a-layout-header class="modern-header">
        <div class="header-container">
            <!-- Left Section: Logo & Brand -->
            <div class="header-left">
                <div class="brand-section">
                    <div class="brand-icon">
                        <ToolOutlined />
                    </div>
                    <div v-if="screens.md" class="brand-text">
                        <span class="brand-name">AutoRepair</span>
                        <span class="brand-tagline">Pro</span>
                    </div>
                </div>
            </div>

            <!-- Center Section: Search (Desktop only) -->
            <div v-if="screens.lg" class="header-center">
                <a-input-search
                    placeholder="Search repairs, clients, vehicles..."
                    size="large"
                    class="global-search"
                    style="max-width: 500px">
                    <template #prefix>
                        <SearchOutlined style="color: rgba(0, 0, 0, 0.45)" />
                    </template>
                </a-input-search>
            </div>

            <!-- Right Section: Actions & User -->
            <div class="header-right">
                <!-- Search Icon (Mobile) -->
                <a-button
                    v-if="!screens.lg"
                    type="text"
                    class="header-action-btn"
                    shape="circle">
                    <SearchOutlined />
                </a-button>

                <!-- Notifications -->
                <a-badge :count="3" :offset="[-5, 5]">
                    <a-button
                        type="text"
                        class="header-action-btn"
                        shape="circle">
                        <BellOutlined />
                    </a-button>
                </a-badge>

                <!-- User Dropdown -->
                <a-dropdown placement="bottomRight">
                    <div class="user-profile">
                        <a-avatar
                            class="user-avatar"
                            :size="40"
                            style="
                                background: linear-gradient(
                                    135deg,
                                    #667eea 0%,
                                    #764ba2 100%
                                );
                            ">
                            {{ userInitials }}
                        </a-avatar>
                        <div v-if="screens.md" class="user-info">
                            <span class="user-name">{{ userName }}</span>
                            <span class="user-role">Administrator</span>
                        </div>
                        <DownOutlined v-if="screens.md" class="dropdown-icon" />
                    </div>
                    <template #overlay>
                        <a-menu class="user-dropdown-menu">
                            <div class="dropdown-header">
                                <a-avatar
                                    :size="48"
                                    style="
                                        background: linear-gradient(
                                            135deg,
                                            #667eea 0%,
                                            #764ba2 100%
                                        );
                                    ">
                                    {{ userInitials }}
                                </a-avatar>
                                <div class="dropdown-user-info">
                                    <strong>{{ userName }}</strong>
                                    <span>{{ user?.email }}</span>
                                </div>
                            </div>
                            <a-menu-divider />
                            <a-menu-item key="profile">
                                <router-link to="/settings">
                                    <UserOutlined />
                                    {{ $t("common.profile") }}
                                </router-link>
                            </a-menu-item>
                            <a-menu-item key="settings">
                                <router-link to="/settings">
                                    <SettingOutlined />
                                    {{ $t("common.settings") }}
                                </router-link>
                            </a-menu-item>
                            <a-menu-divider />
                            <a-menu-item
                                key="logout"
                                @click="handleLogout"
                                class="logout-item">
                                <LogoutOutlined />
                                {{ $t("auth.logout") }}
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </div>
        </div>
    </a-layout-header>
</template>

<style scoped lang="scss">
.modern-header {
    background: #ffffff;
    padding: 0 24px;
    height: 82px;
    line-height: 72px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 1px solid #f0f0f0;
}

.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1600px;
    margin: 0 auto;
}

.header-left {
    display: flex;
    align-items: center;
}

.brand-section {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    gap: 2px;
}

.brand-name {
    font-size: 18px;
    font-weight: 700;
    color: #1f1f1f;
    letter-spacing: -0.5px;
}

.brand-tagline {
    font-size: 12px;
    font-weight: 600;
    color: #667eea;
    text-transform: uppercase;
    letter-spacing: 1px;
}

// Center Section
.header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 0 24px;
}

.global-search {
    :deep(.ant-input-search) {
        border-radius: 12px;
    }

    :deep(.ant-input) {
        border-radius: 12px;
        background: #f5f5f5;
        border: 1px solid transparent;
        transition: all 0.3s;

        &:hover,
        &:focus {
            background: #ffffff;
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
    }
    :deep(.ant-input-affix-wrapper) {
        border: none;
    }

    :deep(.ant-input-search-button) {
        border-radius: 0 12px 12px 0;
    }
}

// Right Section
.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-action-btn {
    font-size: 18px;
    color: #595959;
    transition: all 0.3s;

    &:hover {
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
    }
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        background: rgba(102, 126, 234, 0.05);
    }
}

.user-avatar {
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-weight: 600;
}

.user-info {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
    text-align: left;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: #1f1f1f;
}

.user-role {
    font-size: 12px;
    color: #8c8c8c;
}

.dropdown-icon {
    font-size: 12px;
    color: #8c8c8c;
}

// Dropdown Menu
.user-dropdown-menu {
    min-width: 240px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    padding: 8px;

    .dropdown-header {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .dropdown-user-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        strong {
            font-size: 14px;
            color: #1f1f1f;
        }

        span {
            font-size: 12px;
            color: #8c8c8c;
        }
    }

    :deep(.ant-menu-item) {
        border-radius: 8px;
        margin: 4px 0;
        height: 40px;
        line-height: 40px;

        &:hover {
            background: rgba(102, 126, 234, 0.1);
        }

        a {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #595959;

            &:hover {
                color: #667eea;
            }
        }
    }

    .logout-item {
        color: #ff4d4f;

        &:hover {
            background: rgba(255, 77, 79, 0.1);
        }

        :deep(.anticon) {
            color: #ff4d4f;
        }
    }
}

// Badge customization
:deep(.ant-badge) {
    .ant-badge-count {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        box-shadow: 0 2px 8px rgba(245, 87, 108, 0.4);
    }
}

// Responsive
@media (max-width: 768px) {
    .modern-header {
        padding: 0 16px;
        height: 64px;
        line-height: 64px;
    }

    .brand-name {
        font-size: 16px;
    }

    .user-avatar {
        width: 36px;
        height: 36px;
    }
}

@media (max-width: 576px) {
    .modern-header {
        padding: 0 12px;
    }

    .brand-icon {
        width: 36px;
        height: 36px;
        font-size: 18px;
    }

    .header-right {
        gap: 4px;
    }
}
</style>
