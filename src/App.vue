<script lang="ts" setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { motion, AnimatePresence } from "motion-v";

import enGB from "ant-design-vue/es/locale/en_GB";
import bgBG from "ant-design-vue/es/locale/bg_BG";
import { useLocale } from "@/composables/useLocale";
import { useGlobalState } from "@/composables/useGlobalState";
import { useRoute } from "vue-router";
const route = useRoute();

const { t } = useI18n();

const { initLocale, locale } = useLocale();
const { initState, globalLoading } = useGlobalState();

onMounted(() => {
    initLocale();
    initState();
});

const variants = computed(() => {
    const isAuth = route.meta.layout === "auth";

    return {
        initial: isAuth
            ? { opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }
            : { opacity: 0, y: 30, scale: 0.98 },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1], // smoother spring-like easing
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.98,
            filter: "blur(6px)",
            transition: {
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1],
            },
        },
    };
});
</script>

<template>
    <a-config-provider
        :theme="{
            token: {
                colorPrimary: '#3498DB',
                colorSuccess: '#3E9139',
                colorSuccessBg: '#E4F4E3',
                colorSuccessBorder: '#78C674',
                colorError: '#DB3635',
                colorErrorBg: '#fadbd8',
                colorErrorBorder: '#e74c3c',
                colorWarning: '#EDA81D',
                colorWarningBg: 'rgba(235, 181, 72, 0.20)',
                colorWarningBorder: '#EBB548',
                borderRadiusLG: 6,
                colorLink: '#3498DB',
                fontSize: 16,
                controlPaddingHorizontal: 16,
            },
        }"
        :locale="locale === 'en' ? enGB : bgBG">
        <div style="width: 100%; height: 100%" v-auto-animate>
            <div
                v-if="globalLoading"
                style="
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    flex-direction: column;
                ">
                <a-spin size="large" />
                <h2>{{ t("common.loadingApp") }}</h2>
            </div>
            <AnimatePresence mode="wait" v-else v-auto-animate>
                <motion.div
                    :key="route.fullPath"
                    :initial="variants.initial"
                    :animate="variants.animate"
                    :exit="variants.exit">
                    <router-view />
                </motion.div>
            </AnimatePresence>
        </div>
    </a-config-provider>
    <VueQueryDevtools />
</template>

<style>
#app {
    font-family: "Roboto", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
