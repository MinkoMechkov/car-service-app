<script setup lang="ts">
// Ant Design responsive grid
import { Grid } from "ant-design-vue";
const useBreakpoint = Grid.useBreakpoint;
const screens = useBreakpoint();

// Motion animations
import { motion, AnimatePresence } from "motion-v";

// Vue Router
import { useRoute } from "vue-router";
const route = useRoute();

// Custom UI components (you’ll create them in /components/ui)
import UiHeader from "@/components/ui/Header.vue";
import UiSideMenu from "@/components/ui/SideMenu.vue";
import UiMobileDrawer from "@/components/ui/MobileDrawer.vue";
</script>

<template>
    <a-layout class="app-layout min-h-screen bg-gray-50">
        <!-- Top header -->
        <UiHeader />

        <!-- Main content layout -->
        <a-layout-content class="app-content flex">
            <!-- Sidebar visible only on md+ screens -->
            <UiSideMenu v-if="screens.md" />

            <!-- Page content -->
            <div
                class="app-page-content flex-1 p-4 md:p-6 overflow-auto"
                :class="{ 'pl-0': !screens.md }">
                <AnimatePresence mode="wait">
                    <motion.div
                        :key="route.fullPath"
                        :initial="{ opacity: 0, scale: 1.02 }"
                        :animate="{
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            transition: {
                                duration: 0.3,
                                ease: [0.04, 0.62, 0.23, 0.98],
                            },
                        }"
                        :exit="{
                            opacity: 0,
                            scale: 0.98,
                            transition: {
                                duration: 0.15,
                                ease: [0.4, 0.0, 0.2, 1],
                            },
                        }">
                        <router-view />
                    </motion.div>
                </AnimatePresence>
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
