<script setup lang="ts">
const { t } = useI18n();
function handleTry() {
    window.location.href = '/';
}
</script>

<template>
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh">
        <a-result status="error" :title="t('Something went wrong')" :sub-title="t('Sorry, an unexpected error has occurred. Please try again later or contact support.')">
            <template #extra>
                <a-button type="primary" @click="handleTry">{{ t('Try again') }}</a-button>
            </template>
        </a-result>
    </div>
</template>
