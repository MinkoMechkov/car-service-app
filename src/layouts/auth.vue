<script setup lang="ts">
import logo from "@/assets/images/logo_horizontal.png";
</script>

<template>
    <div class="auth-layout-inner">
        <div class="auth-content">
            <div class="auth-brand">
                <img :src="logo" alt="AutoRepair Pro" class="auth-logo" />
            </div>
            <router-view />
        </div>
    </div>
</template>

