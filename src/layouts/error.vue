<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { motion } from "motion-v";

const route = useRoute();
const router = useRouter();

// Go back to home
const goHome = () => router.push("/");
</script>

<template>
    <a-layout
        class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0, transition: { duration: 0.3 } }"
            class="text-center p-6 bg-white shadow-md rounded-2xl">
            <h1 class="text-5xl font-bold text-gray-800 mb-2">Oops!</h1>
            <p class="text-gray-500 mb-6">
                <span v-if="route.name === 'NotFound'"
                    >The page you're looking for doesn't exist.</span
                >
                <span v-else>An unexpected error occurred.</span>
            </p>

            <a-button type="primary" size="large" @click="goHome">
                Go back home
            </a-button>
        </motion.div>

        <!-- Optional footer -->
        <p class="mt-8 text-gray-400 text-sm">
            &copy; {{ new Date().getFullYear() }} AutoManager. All rights
            reserved.
        </p>
    </a-layout>
</template>

<style scoped>
a-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f9fafb;
}
</style>
