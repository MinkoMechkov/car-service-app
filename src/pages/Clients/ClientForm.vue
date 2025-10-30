<script setup lang="ts">
import { reactive, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { Client } from "@/api/clients/interfaces";
import {
    useClientQuery,
    useUnregisteredClientsQuery,
} from "@/api/clients/queries";
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

type ClientFormModel = Omit<Client, "id" | "created_at"> & {
    user_id?: string | null;
};

const formState = reactive<ClientFormModel>({
    name: "",
    phone: null,
    email: null,
    address: null,
    notes: null,
    user_id: null,
});

const clientQuery = useClientQuery(String(route.params.id || ""));
const unregisteredClientsQuery = useUnregisteredClientsQuery();

watch(
    () => clientQuery.data.value,
    (c) => {
        if (!c) return;
        formState.name = c.name;
        formState.phone = c.phone ?? null;
        formState.email = c.email ?? null;
        formState.address = c.address ?? null;
        formState.notes = c.notes ?? null;
        formState.user_id = c.user_id ?? null;
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
    const payload: ClientFormModel = { ...formState };
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

//Unlink function for edit mode
const unlinkUser = () => {
    formState.user_id = null;
};
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
                    <a-col :xs="24">
                        <a-form-item
                            :label="$t('clients.associateUser') || 'Associate with User Account'"
                            name="user_id">
                            <a-select 
                                v-if="!formState.user_id || !isEditMode" 
                                v-model:value="formState.user_id" 
                                :loading="unregisteredClientsQuery.isLoading.value"
                                :placeholder="$t('clients.selectUser') || 'Select unregistered user (optional)'"
                                allow-clear
                                style="width: 100%">
                                <a-select-option 
                                    v-for="u in unregisteredClientsQuery.data.value || []" 
                                    :key="u.id" 
                                    :value="u.id">
                                    <div>
                                        <strong>{{ u.full_name || 'Unnamed User' }}</strong>
                                        <small style="color: #999; display: block;">{{ u.email }}</small>
                                    </div>
                                </a-select-option>
                            </a-select>
                            <a-tag 
                                v-else 
                                color="green" 
                                :closable="isEditMode" 
                                @close="unlinkUser"
                                style="margin-top: 8px">
                                {{ $t('clients.linkedTo') || 'Linked to' }} {{ formState.user_id?.substring(0,8) + '...' }} 
                                ({{ clientQuery.data?.value.email || 'N/A' }})
                            </a-tag>
                            <small v-if="!isEditMode" style="color: #999; display: block; margin-top: 4px;">
                                {{ $t('clients.associateHint') || 'Leave empty for manual clients. Auto-links for registered users.' }}
                            </small>
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
