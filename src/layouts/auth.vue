<script setup lang="ts">
import { motion } from "motion-v";
import { useRoute } from "vue-router";

const appName = "Auto Repair System";
const appDescription = "Manage your auto repair business efficiently";
const route = useRoute();
</script>

<template>
    <div class="auth-layout">
        <div class="auth-content">
            <div class="auth-brand">
                <h1>{{ appName }}</h1>
                <p>{{ appDescription }}</p>
            </div>
            <router-view />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: "auth-layout",
};
</script>

<style scoped lang="scss">
.auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.auth-content {
    max-width: 600px;
    width: 100%;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    transform-origin: center;
}

.auth-brand {
    text-align: center;
    color: white;
    margin-bottom: 32px;

    h1 {
        font-size: 38px;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
    }

    p {
        font-size: 16px;
        opacity: 0.85;
    }
}
</style>
