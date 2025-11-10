<script setup lang="ts">
import { reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { authMutations } from "@/api/auth/mutations";
import { useI18n } from "vue-i18n";
import type { Rule } from "ant-design-vue/es/form";
import { CheckCircleOutlined } from "@ant-design/icons-vue";

const { t } = useI18n();
const loading = ref(false);
const submitted = ref(false);

const formState = reactive({
    email: "",
});

const rules: Record<string, Rule[]> = {
    email: [
        { required: true, message: t("auth.emailRequired"), trigger: "blur" },
        { type: "email", message: t("auth.emailInvalid"), trigger: "blur" },
    ],
};

const onFinish = async (values: { email: string }) => {
    try {
        loading.value = true;
        await authMutations.resetPassword(values);
        submitted.value = true;
    } catch (error: any) {
        message.error(error.message || t("auth.resetPasswordError"));
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="forgot-password-container">
        <div class="auth-form-wrapper">
            <h1 class="auth-title">{{ $t("auth.forgotPassword") }}</h1>
            <p class="auth-subtitle" v-if="!submitted">
                {{ $t("auth.forgotPasswordDesc") }}
            </p>

            <a-form
                v-if="!submitted"
                :model="formState"
                :rules="rules"
                @finish="onFinish"
                layout="vertical"
                class="auth-form">
                <a-form-item
                    name="email"
                    :label="$t('auth.email')"
                    class="form-item-modern">
                    <a-input
                        v-model:value="formState.email"
                        type="email"
                        :placeholder="$t('auth.emailPlaceholder')"
                        size="large"
                        class="modern-input" />
                </a-form-item>

                <a-form-item class="submit-item">
                    <a-button
                        html-type="submit"
                        :loading="loading"
                        block
                        size="large"
                        class="gradient-button">
                        {{ $t("auth.sendResetLink") }}
                    </a-button>
                </a-form-item>

                <div class="auth-footer">
                    <router-link to="/auth/login" class="auth-link">
                        {{ $t("auth.backToLogin") }}
                    </router-link>
                </div>
            </a-form>

            <div v-else class="success-result">
                <div class="success-icon">
                    <check-circle-outlined />
                </div>
                <h2 class="success-title">{{ $t("auth.resetEmailSent") }}</h2>
                <p class="success-subtitle">
                    {{ $t("auth.resetEmailSentDesc") }}
                </p>
                <router-link to="/auth/login">
                    <a-button class="gradient-button" size="large">
                        {{ $t("auth.backToLogin") }}
                    </a-button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.forgot-password-container {
    width: 100%;
}

.auth-form-wrapper {
    width: 100%;
}

.auth-title {
    font-size: 32px;
    font-weight: 700;
    color: #1f1f1f;
    margin: 0 0 8px 0;
    text-align: center;
}

.auth-subtitle {
    font-size: 15px;
    color: #8c8c8c;
    margin: 0 0 32px 0;
    text-align: center;
}

.auth-form {
    margin-top: 24px;
}

.form-item-modern {
    :deep(.ant-form-item-label) {
        label {
            font-weight: 600;
            color: #262626;
            font-size: 14px;
        }
    }

    margin-bottom: 20px;
}

.modern-input {
    :deep(.ant-input) {
        border-radius: 12px;
        border: 2px solid #e8e8e8;
        transition: all 0.3s;
        font-size: 15px;

        &:hover {
            border-color: #30cfd0;
        }

        &:focus,
        &.ant-input-focused {
            border-color: #30cfd0;
            box-shadow: 0 0 0 3px rgba(48, 207, 208, 0.1);
        }
    }
}

.submit-item {
    margin-top: 8px;
    margin-bottom: 24px;
}

.auth-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
}

.auth-link {
    color: #30cfd0;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
        color: #330867;
        text-decoration: underline;
    }
}

.success-result {
    text-align: center;
    padding: 24px 0;
}

.success-icon {
    font-size: 64px;
    color: #52c41a;
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
}

.success-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f1f1f;
    margin: 0 0 12px 0;
}

.success-subtitle {
    font-size: 15px;
    color: #8c8c8c;
    margin: 0 0 32px 0;
}

.success-result .gradient-button {
    width: 100%;
}
</style>
