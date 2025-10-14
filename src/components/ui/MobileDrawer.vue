<script setup lang="ts">
import { ref } from "vue";
const visible = ref(false);

const menuItems = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "clients", label: "Clients", path: "/clients" },
  { key: "vehicles", label: "Vehicles", path: "/vehicles" },
  { key: "repairs", label: "Repairs", path: "/repairs" },
  { key: "settings", label: "Settings", path: "/settings" },
];
</script>

<template>
  <a-drawer
    v-model:open="visible"
    placement="left"
    title="Menu"
    width="240"
  >
    <a-menu mode="inline">
      <a-menu-item
        v-for="item in menuItems"
        :key="item.key"
      >
        {{ item.label }}
      </a-menu-item>
    </a-menu>
  </a-drawer>
</template>
