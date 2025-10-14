<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { authMutations } from '@/api/auth/mutations';
import type { LoginCredentials } from '@/api/auth/interfaces';
import { useI18n } from 'vue-i18n';
import type { Rule } from 'ant-design-vue/es/form';

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);

const formState = reactive<LoginCredentials>({
  email: '',
  password: '',
});

const rules: Record<string, Rule[]> = {
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMin'), trigger: 'blur' },
  ],
};

const onFinish = async (values: LoginCredentials) => {
  try {
    loading.value = true;
    await authMutations.loginUser(values);
    message.success(t('auth.loginSuccess'));
    router.push('/');
  } catch (error: any) {
    message.error(error.message || t('auth.loginError'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <a-card class="login-card" :title="$t('auth.login')">
      <a-form
        :model="formState"
        :rules="rules"
        @finish="onFinish"
        layout="vertical"
      >
        <a-form-item name="email" :label="$t('auth.email')">
          <a-input
            v-model:value="formState.email"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            size="large"
          />
        </a-form-item>

        <a-form-item name="password" :label="$t('auth.password')">
          <a-input-password
            v-model:value="formState.password"
            :placeholder="$t('auth.passwordPlaceholder')"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            block
            size="large"
          >
            {{ $t('auth.login') }}
          </a-button>
        </a-form-item>

        <div class="login-footer">
          <router-link to="/auth/register">
            {{ $t('auth.noAccount') }}
          </router-link>
          <router-link to="/auth/forgot-password">
            {{ $t('auth.forgotPassword') }}
          </router-link>
        </div>
      </a-form>
    </a-card>
  </div>
</template>


<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
</style>