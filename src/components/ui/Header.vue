<template>
  <a-layout-header class="ui-header">
    <div class="header-left">
      <a-button 
        class="menu-trigger" 
        type="text" 
        @click="emit('toggle-menu')"
      >
        <MenuOutlined />
      </a-button>
      <h1 class="header-title">{{ title }}</h1>
    </div>
    
    <div class="header-right">
      <a-dropdown>
        <a-button type="text">
          <UserOutlined />
          <span class="user-name">{{ userName }}</span>
          <DownOutlined />
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile">
              <router-link to="/settings">
                <SettingOutlined />
                {{ $t('common.settings') }}
              </router-link>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout" @click="handleLogout">
              <LogoutOutlined />
              {{ $t('auth.logout') }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  MenuOutlined, 
  UserOutlined, 
  DownOutlined, 
  SettingOutlined,
  LogoutOutlined 
} from '@ant-design/icons-vue';
import { useGlobalState } from '@/composables/useGlobalState';
import { useI18n } from 'vue-i18n';

defineProps<{
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'toggle-menu'): void;
}>();

const { t } = useI18n();
const router = useRouter();
const { user, signOut } = useGlobalState();

const userName = computed(() => {
  return user.value?.user_metadata?.full_name || 
         user.value?.email?.split('@')[0] || 
         'User';
});

const handleLogout = async () => {
  try {
    await signOut();
    message.success(t('auth.logoutSuccess'));
    router.push('/auth/login');
  } catch (error: any) {
    message.error(error.message || t('auth.logoutError'));
  }
};
</script>

<style scoped lang="scss">
.ui-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-trigger {
  font-size: 18px;
}

.header-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  margin: 0 8px;
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}
</style>