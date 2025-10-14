<script lang="ts" setup>
import { motion } from "motion-v";
</script>

<template>
    <div v-auto-animate>
        <motion.div
            :initial="{ opacity: 0, y: 12 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.35, ease: 'easeOut', delay: 0.0 }">
            <title>Test Page - Car Service App</title>
        </motion.div>
    </div>
</template>
