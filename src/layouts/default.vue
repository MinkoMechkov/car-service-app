<script setup lang="ts">
import { Grid } from "ant-design-vue";
import UiHeader from "@/components/ui/Header.vue";
import UiMobileDrawer from "@/components/ui/MobileDrawer.vue";

const useBreakpoint = Grid.useBreakpoint;
const screens = useBreakpoint();

</script>

<template>
    <a-layout class="app-layout min-h-screen bg-gray-50">
        <!-- Top header -->
        <UiHeader />
        <!-- Main content layout -->
        <a-layout-content class="app-content flex">
            <!-- Sidebar visible only on md+ screens -->
            <!-- <UiSideMenu /> -->
            <!-- Page content -->
            <div
                class="app-page-content flex-1 p-4 md:p-6 overflow-auto"
                :class="{ 'pl-0': !screens.md }">
                <router-view />
            </div>
        </a-layout-content>

        <!-- Mobile drawer (for small screens) -->
        <UiMobileDrawer v-if="!screens.md" />
    </a-layout>
</template>

<style scoped>
.app-layout {
    min-height: 100vh;
    background-color: #f9fafb;
}

.app-content {
    display: flex;
    flex: 1;
}

.app-page-content {
    flex: 1;
    min-height: calc(100vh - 64px);
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
