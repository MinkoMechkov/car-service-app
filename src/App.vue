<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";

import enGB from "ant-design-vue/es/locale/en_GB";
import bgBG from "ant-design-vue/es/locale/bg_BG";
import { useLocale } from "@/composables/useLocale";
import { useGlobalState } from "@/composables/useGlobalState";

const route = useRoute();
const { t } = useI18n();

const { initLocale, locale } = useLocale();
const { initState, globalLoading } = useGlobalState();


onMounted(() => {
    initLocale();
    initState();
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
            <div v-if="globalLoading" style="/* your loading styles */">
                <a-spin size="large" />
                <h2>{{ t("common.loadingApp") }}</h2>
            </div>
            <router-view v-else v-auto-animate />
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
