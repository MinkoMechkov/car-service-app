<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { registerUser } from '@/api/auth/mutations';
import type { RegisterCredentials } from '@/api/auth/interfaces';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);

const formState = reactive<RegisterCredentials>({
  email: '',
  password: '',
  fullName: '',
});

const rules = {
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMin'), trigger: 'blur' },
  ],
  fullName: [
    { required: true, message: t('auth.fullNameRequired'), trigger: 'blur' },
  ],
};

const onFinish = async (values: RegisterCredentials) => {
  try {
    loading.value = true;
    const response = await registerUser(values);
    if (response.success) {
      message.success(t('auth.registerSuccess'));
      router.push('/auth/login');
    } else {
      message.error(response.error || t('auth.registerError'));
    }
  } catch (error: any) {
    message.error(error.message || t('auth.registerError'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <a-card class="register-card" :title="$t('auth.register')">
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

        <a-form-item name="fullName" :label="$t('auth.fullName')">
          <a-input
            v-model:value="formState.fullName"
            :placeholder="$t('auth.fullNamePlaceholder')"
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
            {{ $t('auth.register') }}
          </a-button>
        </a-form-item>

        <div class="register-footer">
          <router-link to="/auth/login">
            {{ $t('auth.alreadyHaveAccount') }}
          </router-link>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped lang="scss">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.register-footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
