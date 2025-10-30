<script setup lang="ts">
import { reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { authMutations } from "@/api/auth/mutations";
import type { RegisterCredentials } from "@/api/auth/interfaces";
import type { Rule } from "ant-design-vue/es/form";

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
        return Promise.reject(t("auth.phoneInvalid") || "Phone number too short");
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
        <a-card class="register-card" :title="$t('auth.register')">
            <a-form
                :model="formState"
                :rules="rules"
                @finish="onFinish"
                layout="vertical">
                <a-form-item name="fullName" :label="$t('auth.fullName')">
                    <a-input
                        v-model:value="formState.fullName"
                        :placeholder="$t('auth.fullNamePlaceholder')"
                        size="large" />
                </a-form-item>

                <a-form-item name="email" :label="$t('auth.email')">
                    <a-input
                        v-model:value="formState.email"
                        type="email"
                        :placeholder="$t('auth.emailPlaceholder')"
                        size="large" />
                </a-form-item>

                <a-form-item name="phone" :label="$t('auth.phone') || 'Phone'">
                    <a-input
                        v-model:value="formState.phone"
                        :placeholder="$t('auth.phonePlaceholder') || '+359 123 456 789'"
                        size="large" />
                </a-form-item>
                
                <a-form-item name="password" :label="$t('auth.password')">
                    <a-input-password
                        v-model:value="formState.password"
                        :placeholder="$t('auth.passwordPlaceholder')"
                        size="large" />
                </a-form-item>

                <a-form-item
                    name="confirmPassword"
                    :label="$t('auth.confirmPassword')">
                    <a-input-password
                        v-model:value="formState.confirmPassword"
                        :placeholder="$t('auth.confirmPasswordPlaceholder')"
                        size="large" />
                </a-form-item>

                <a-form-item>
                    <a-button
                        type="primary"
                        html-type="submit"
                        :loading="loading"
                        block
                        size="large">
                        {{ $t("auth.register") }}
                    </a-button>
                </a-form-item>

                <div class="register-footer">
                    <router-link to="/auth/login">
                        {{ $t("auth.hasAccount") }}
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
    padding: 20px;
}

.register-card {
    width: 100%;
    max-width: 450px;
}

.register-footer {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}
</style>
