<script setup lang="ts">
import { reactive, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { Client } from "@/api/clients/interfaces";
import { useClientQuery } from "@/api/clients/queries";
import {
    useCreateClientMutation,
    useUpdateClientMutation,
} from "@/api/clients/mutations";
import { message } from "ant-design-vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const isEditMode = computed(() => !!route.params.id);
const loading = ref(false);

type ClientFormModel = Omit<Client, "id" | "created_at">;

const formState = reactive<ClientFormModel>({
    name: "",
    phone: null,
    email: null,
    address: null,
    notes: null,
});

const clientQuery = useClientQuery(String(route.params.id || ""));

watch(
    () => clientQuery.data.value,
    (c) => {
        if (!c) return;
        formState.name = c.name;
        formState.phone = c.phone ?? null;
        formState.email = c.email ?? null;
        formState.address = c.address ?? null;
        formState.notes = c.notes ?? null;
    },
    { immediate: true }
);

watchEffect(() => {
    if (isEditMode.value) {
        loading.value = clientQuery.isLoading.value;
    } else {
        loading.value = false;
    }
});

const createMutation = useCreateClientMutation();
const updateMutation = useUpdateClientMutation();

const submit = async () => {
    const payload: Omit<Client, "id" | "created_at"> = { ...formState };
    try {
        if (isEditMode.value) {
            await updateMutation.mutateAsync({
                id: String(route.params.id),
                ...payload,
            });
            message.success(t("clients.updated") || "Client updated");
        } else {
            await createMutation.mutateAsync(payload);
            message.success(t("clients.created") || "Client created");
        }
        router.push("/clients");
    } catch (e: any) {
        message.error(e?.message || "Operation failed");
    }
};

const cancel = () => router.back();
</script>

<template>
    <div class="client-form">
        <a-card
            :title="
                isEditMode
                    ? $t('clients.editTitle') || 'Edit Client'
                    : $t('clients.newTitle') || 'New Client'
            "
            :loading="loading">
            <a-form layout="vertical" :model="formState" @finish="submit">
                <a-row :gutter="16">
                    <a-col :xs="24" :md="12">
                        <a-form-item
                            :label="$t('clients.name') || 'Name'"
                            name="name"
                            :rules="[
                                {
                                    required: true,
                                    message: $t('validation.required'),
                                },
                            ]">
                            <a-input v-model:value="formState.name" />
                        </a-form-item>
                    </a-col>
                    <a-col :xs="24" :md="12">
                        <a-form-item
                            :label="$t('clients.email') || $t('auth.email')"
                            name="email">
                            <a-input v-model:value="formState.email" />
                        </a-form-item>
                    </a-col>
                    <a-col :xs="24" :md="12">
                        <a-form-item
                            :label="$t('clients.phone') || 'Phone'"
                            name="phone">
                            <a-input v-model:value="formState.phone" />
                        </a-form-item>
                    </a-col>
                    <a-col :xs="24" :md="12">
                        <a-form-item
                            :label="$t('clients.address') || 'Address'"
                            name="address">
                            <a-input v-model:value="formState.address" />
                        </a-form-item>
                    </a-col>
                    <a-col :xs="24">
                        <a-form-item
                            :label="$t('clients.notes') || 'Notes'"
                            name="notes">
                            <a-textarea
                                v-model:value="formState.notes"
                                :rows="3" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-space>
                    <a-button @click="cancel">{{
                        $t("common.cancel")
                    }}</a-button>
                    <a-button type="primary" html-type="submit">{{
                        isEditMode ? $t("common.update") : $t("common.create")
                    }}</a-button>
                </a-space>
            </a-form>
        </a-card>
    </div>
</template>
