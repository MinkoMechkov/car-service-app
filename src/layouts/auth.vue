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

<script setup lang="ts">
const appName = 'Auto Repair System';
const appDescription = 'Manage your auto repair business efficiently';
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
  max-width: 450px;
  width: 100%;
}

.auth-brand {
  text-align: center;
  color: white;
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
  }
}
</style>