<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { authMutations } from "@/api/auth/mutations";
import type { LoginCredentials } from "@/api/auth/interfaces";
import { useI18n } from "vue-i18n";
import type { Rule } from "ant-design-vue/es/form";

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);

const formState = reactive<LoginCredentials>({
    email: "",
    password: "",
});

const rules: Record<string, Rule[]> = {
    email: [
        { required: true, message: t("auth.emailRequired"), trigger: "blur" },
        { type: "email", message: t("auth.emailInvalid"), trigger: "blur" },
    ],
    password: [
        {
            required: true,
            message: t("auth.passwordRequired"),
            trigger: "blur",
        },
        { min: 6, message: t("auth.passwordMin"), trigger: "blur" },
    ],
};

const onFinish = async (values: LoginCredentials) => {
    try {
        loading.value = true;
        await authMutations.login(values);
        message.success(t("auth.loginSuccess"));
        router.push("/");
    } catch (error: any) {
        message.error(error.message || t("auth.loginError"));
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="login-container">
        <div class="auth-form-wrapper">
            <h1 class="auth-title">{{ $t("auth.login") }}</h1>
            <p class="auth-subtitle">
                {{
                    $t("auth.loginSubtitle") ||
                    "Welcome back! Please login to your account."
                }}
            </p>

            <a-form
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

                <a-form-item
                    name="password"
                    :label="$t('auth.password')"
                    class="form-item-modern">
                    <a-input-password
                        v-model:value="formState.password"
                        :placeholder="$t('auth.passwordPlaceholder')"
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
                        {{ $t("auth.login") }}
                    </a-button>
                </a-form-item>

                <div class="auth-footer">
                    <router-link to="/auth/forgot-password" class="auth-link">
                        {{ $t("auth.forgotPassword") }}
                    </router-link>
                    <div class="auth-divider">|</div>
                    <router-link to="/auth/register" class="auth-link">
                        {{ $t("auth.noAccount") }}
                    </router-link>
                </div>
            </a-form>
        </div>
    </div>
</template>

<style scoped lang="scss">
.login-container {
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

.submit-item {
    margin-top: 8px;
    margin-bottom: 24px;
}

.auth-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
    flex-wrap: wrap;
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

.auth-divider {
    color: #d9d9d9;
    font-size: 14px;
}
</style>
