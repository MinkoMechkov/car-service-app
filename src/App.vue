<script setup lang="ts">
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";

import enGB from "ant-design-vue/es/locale/en_GB";
import bgBG from "ant-design-vue/es/locale/bg_BG";

const route = useRoute();
const { t } = useI18n();

const { initLocale, locale } = useLocale();



onMounted(() => {
    initLocale();
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
        :locale="locale === 'bg' ? bgBG : enGB">
        <div style="width: 100%; height: 100%" v-auto-animate>
           <div style="height: 100%; display: flex; justify-content: center">
               
            </div>
        </div>
    </a-config-provider>
    <VueQueryDevtools />
</template>
