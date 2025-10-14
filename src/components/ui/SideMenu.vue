<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const menuItems = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "clients", label: "Clients", path: "/clients" },
  { key: "vehicles", label: "Vehicles", path: "/vehicles" },
  { key: "repairs", label: "Repairs", path: "/repairs" },
  { key: "settings", label: "Settings", path: "/settings" },
];

const handleMenuClick = (path: string) => router.push(path);
</script>

<template>
  <a-layout-sider width="220" class="bg-white shadow-sm">
    <a-menu
      mode="inline"
      :selectedKeys="[route.name?.toString()]"
      @click="({ key }) => handleMenuClick(menuItems.find(i => i.key === key)?.path || '/')"
    >
      <a-menu-item
        v-for="item in menuItems"
        :key="item.key"
      >
        {{ item.label }}
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>
