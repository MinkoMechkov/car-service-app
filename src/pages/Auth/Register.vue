<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { authMutations } from "@/api/auth/mutations";
import type { RegisterCredentials } from "@/api/auth/interfaces";
import type { Rule } from "ant-design-vue/es/form";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const loading = ref(false);

interface FormState extends RegisterCredentials {
    confirmPassword?: string;
}

const formState = reactive<FormState>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    confirmPassword: "",
});

const validateConfirmPassword = async (_rule: Rule, value: string) => {
    if (value === "") {
        return Promise.reject(t("auth.confirmPasswordRequired"));
    } else if (value !== formState.password) {
        return Promise.reject(t("auth.passwordsNotMatch"));
    } else {
        return Promise.resolve();
    }
};

const validatePhone = async (_rule: Rule, value: string) => {
    if (value && value.length < 7) {
        return Promise.reject(
            t("auth.phoneInvalid") || "Phone number too short"
        );
    }
    return Promise.resolve();
};

const rules: Record<string, Rule[]> = {
    fullName: [
        {
            required: true,
            message: t("auth.fullNameRequired"),
            trigger: "blur",
        },
    ],
    email: [
        { required: true, message: t("auth.emailRequired"), trigger: "blur" },
        { type: "email", message: t("auth.emailInvalid"), trigger: "blur" },
    ],
    phone: [
        {
            validator: validatePhone,
            trigger: "blur",
        },
    ],
    password: [
        {
            required: true,
            message: t("auth.passwordRequired"),
            trigger: "blur",
        },
        { min: 6, message: t("auth.passwordMin"), trigger: "blur" },
    ],
    confirmPassword: [
        {
            required: true,
            validator: validateConfirmPassword,
            trigger: "change",
        },
    ],
};

const onFinish = async (values: FormState) => {
    try {
        loading.value = true;
        await authMutations.register({
            email: values.email,
            password: values.password,
            fullName: values.fullName,
            phone: values.phone || undefined,
        });
        message.success(t("auth.registerSuccess"));
        router.push("/auth/login");
    } catch (error: any) {
        message.error(error.message || t("auth.registerError"));
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="register-container">
        <div class="auth-form-wrapper">
            <h1 class="auth-title">{{ $t("auth.register") }}</h1>
            <p class="auth-subtitle">
                {{
                    $t("auth.registerSubtitle") ||
                    "Create your account to get started."
                }}
            </p>

            <a-form
                :model="formState"
                :rules="rules"
                @finish="onFinish"
                layout="vertical"
                class="auth-form">
                <a-form-item
                    name="fullName"
                    :label="$t('auth.fullName')"
                    class="form-item-modern">
                    <a-input
                        v-model:value="formState.fullName"
                        :placeholder="$t('auth.fullNamePlaceholder')"
                        size="large"
                        class="modern-input" />
                </a-form-item>

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
                    name="phone"
                    :label="$t('auth.phone') || 'Phone'"
                    class="form-item-modern">
                    <a-input
                        v-model:value="formState.phone"
                        :placeholder="
                            $t('auth.phonePlaceholder') || '+359 123 456 789'
                        "
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

                <a-form-item
                    name="confirmPassword"
                    :label="$t('auth.confirmPassword')"
                    class="form-item-modern">
                    <a-input-password
                        v-model:value="formState.confirmPassword"
                        :placeholder="$t('auth.confirmPasswordPlaceholder')"
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
                        {{ $t("auth.register") }}
                    </a-button>
                </a-form-item>

                <div class="auth-footer">
                    <router-link to="/auth/login" class="auth-link">
                        {{ $t("auth.hasAccount") }}
                    </router-link>
                </div>
            </a-form>
        </div>
    </div>
</template>

<style scoped lang="scss">
.register-container {
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

.gradient-button {
    background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
    border: none;
    border-radius: 12px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(48, 207, 208, 0.4);
    transition: all 0.3s;

    &:hover,
    &:focus {
        background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
        box-shadow: 0 6px 20px rgba(48, 207, 208, 0.5);
        transform: translateY(-2px);
        color: #ffffff;
    }

    &:active {
        transform: translateY(0);
    }
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
</style>
