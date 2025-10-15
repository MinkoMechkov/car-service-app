<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { authMutations } from '@/api/auth/mutations';
import { useI18n } from 'vue-i18n';
import type { Rule } from 'ant-design-vue/es/form';

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);
const submitted = ref(false);

const formState = reactive({
  email: '',
});

const rules: Record<string, Rule[]> = {
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' },
  ],
};

const onFinish = async (values: { email: string }) => {
  try {
    loading.value = true;
    await authMutations.resetPassword(values);
    submitted.value = true;
  } catch (error: any) {
    message.error(error.message || t('auth.resetPasswordError'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="forgot-password-container">
    <a-card class="forgot-password-card" :title="$t('auth.forgotPassword')">
      <p class="description">{{ $t('auth.forgotPasswordDesc') }}</p>
      
      <a-form
        v-if="!submitted"
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

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            block
            size="large"
          >
            {{ $t('auth.sendResetLink') }}
          </a-button>
        </a-form-item>

        <div class="footer">
          <router-link to="/auth/login">
            {{ $t('auth.backToLogin') }}
          </router-link>
        </div>
      </a-form>

      <a-result
        v-else
        status="success"
        :title="$t('auth.resetEmailSent')"
        :sub-title="$t('auth.resetEmailSentDesc')"
      >
        <template #extra>
          <a-button type="primary" @click="router.push('/auth/login')">
            {{ $t('auth.backToLogin') }}
          </a-button>
        </template>
      </a-result>
    </a-card>
  </div>
</template>


<style scoped lang="scss">
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.forgot-password-card {
  width: 100%;
  max-width: 400px;
}

.description {
  margin-bottom: 24px;
  color: rgba(0, 0, 0, 0.65);
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>