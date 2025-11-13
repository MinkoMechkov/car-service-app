<script setup lang="ts">
  import { motion, AnimatePresence } from 'motion-v';
  import logo from '@/assets/images/logo_horizontal.png';

  const route = useRoute();
</script>

<template>
  <a-layout>
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
        <div class="auth-layout-inner">
          <div class="auth-content">
            <div class="auth-brand">
              <img :src="logo" alt="AutoRepair Pro" class="auth-logo" />
            </div>
            <router-view />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </a-layout>
</template>
