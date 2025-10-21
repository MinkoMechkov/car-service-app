<script setup lang="ts">
import { Grid } from "ant-design-vue";
import { motion } from "motion-v";
import UiHeader from "@/components/ui/Header.vue";
import UiMobileDrawer from "@/components/ui/MobileDrawer.vue";

const useBreakpoint = Grid.useBreakpoint;
const screens = useBreakpoint();
const route = useRoute();
</script>

<template>
    <a-layout class="app-layout">
        <!-- Top header -->
        <UiHeader />
        <!-- Main content layout -->
        <a-layout-content class="app-content">
            <!-- Sidebar visible only on md+ screens -->
            <!-- <UiSideMenu /> -->
            <!-- Page content -->
            <div class="app-page-content" :class="{ 'pl-0': !screens.md }">
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
                        <router-view :key="route.fullPath"/>
                    </motion.div>
                </AnimatePresence>
            </div>
        </a-layout-content>

        <!-- Mobile drawer (for small screens) -->
        <UiMobileDrawer v-if="!screens.md" />
    </a-layout>
</template>
