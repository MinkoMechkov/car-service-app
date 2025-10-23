<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { useVehicleQuery } from "@/api/vehicles/queries";
import {
    useCreateVehicleMutation,
    useUpdateVehicleMutation,
} from "@/api/vehicles/mutations";
import { useClientsQuery } from "@/api/clients/queries";
import type { Vehicle } from "@/api/vehicles/interfaces";
import type { RuleObject } from "ant-design-vue/es/form";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons-vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const vehicleId = computed(() => route.params.id as string);
const isEdit = computed(() => !!vehicleId.value && vehicleId.value !== "new");

const vehicleQuery = useVehicleQuery(vehicleId.value);
const clientsQuery = useClientsQuery();
const createMutation = useCreateVehicleMutation();
const updateMutation = useUpdateVehicleMutation();

const formRef = ref();
const formState = ref<Partial<Vehicle>>({
    client_id: null,
    make: "",
    model: "",
    year: null,
    license_plate: "",
    vin: null,
    mileage: null,
});

const rules = computed<Record<string, RuleObject[]>>(() => ({
  make: [
    {
      required: true,
      message: t("validation.required", { field: "Make" }),
      trigger: "blur",
      type: "string",
    },
  ],
  model: [
    {
      required: true,
      message: t("validation.required", { field: "Model" }),
      trigger: "blur",
      type: "string",
    },
  ],
  license_plate: [
    {
      required: true,
      message: t("validation.required", { field: "License Plate" }),
      trigger: "blur",
      type: "string",
    },
  ],
  year: [
    {
      type: "number",
      min: 1900,
      max: new Date().getFullYear() + 1,
      message: `Year must be between 1900 and ${new Date().getFullYear() + 1}`,
      trigger: "change",
    },
  ],
  mileage: [
    {
      type: "number",
      min: 0,
      message: "Mileage must be a positive number",
      trigger: "change",
    },
  ],
}));
watch(
    () => vehicleQuery.data.value,
    (vehicle) => {
        if (vehicle && isEdit.value) {
            formState.value = {
                client_id: vehicle.client_id,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                license_plate: vehicle.license_plate,
                vin: vehicle.vin,
                mileage: vehicle.mileage,
            };
        }
    },
    { immediate: true }
);

const clientOptions = computed(() =>
    (clientsQuery.data.value || []).map((client) => ({
        label: client.name,
        value: client.id,
    }))
);

const loading = computed(
    () => createMutation.isPending.value || updateMutation.isPending.value
);

const handleSubmit = async () => {
    try {
        await formRef.value.validate();

        if (isEdit.value) {
            await updateMutation.mutateAsync({
                id: vehicleId.value,
                ...formState.value,
            });
            message.success(
                t("vehicles.updateSuccess") || "Vehicle updated successfully"
            );
        } else {
            await createMutation.mutateAsync(
                formState.value as Omit<Vehicle, "id" | "created_at">
            );
            message.success(
                t("vehicles.createSuccess") || "Vehicle created successfully"
            );
        }

        router.push("/vehicles");
    } catch (error) {
        console.error("Form validation failed:", error);
        message.error(t("vehicles.updateError") || "Failed to update vehicle. Check console.");  
    }
};

const handleCancel = () => {
    router.push("/vehicles");
};

watch(
  () => vehicleQuery.error.value,
  (err) => {
    if (err) {
      console.error('❌ Vehicle Query Error:', err);
    }
  }
);

</script>

<template>
    <div class="vehicle-form-container">
        <a-card :bordered="false" class="form-card">
            <template #title>
                <div class="card-header">
                    <span class="card-title">
                        {{
                            isEdit
                                ? $t("vehicles.edit") || "Edit Vehicle"
                                : $t("vehicles.new") || "New Vehicle"
                        }}
                    </span>
                </div>
            </template>

            <a-spin :spinning="vehicleQuery.isLoading.value && isEdit">
                <a-form
                    ref="formRef"
                    :model="formState"
                    :rules="rules"
                    layout="vertical"
                    class="vehicle-form">
                    <a-row :gutter="24">
                        <a-col :xs="24" :lg="12">
                            <a-form-item
                                :label="$t('vehicles.make') || 'Make'"
                                name="make">
                                <a-input
                                    v-model:value="formState.make"
                                    :placeholder="
                                        $t('vehicles.makePlaceholder') ||
                                        'e.g., Toyota, BMW, Ford'
                                    "
                                    size="large" />
                            </a-form-item>
                        </a-col>

                        <a-col :xs="24" :lg="12">
                            <a-form-item
                                :label="$t('vehicles.model') || 'Model'"
                                name="model">
                                <a-input
                                    v-model:value="formState.model"
                                    :placeholder="
                                        $t('vehicles.modelPlaceholder') ||
                                        'e.g., Camry, X5, F-150'
                                    "
                                    size="large" />
                            </a-form-item>
                        </a-col>
                    </a-row>

                    <a-row :gutter="24">
                        <a-col :xs="24" :lg="12">
                            <a-form-item
                                :label="$t('vehicles.year') || 'Year'"
                                name="year">
                                <a-input-number
                                    v-model:value="formState.year"
                                    :placeholder="
                                        $t('vehicles.yearPlaceholder') ||
                                        'e.g., 2020'
                                    "
                                    :min="1900"
                                    :max="new Date().getFullYear() + 1"
                                    size="large"
                                    style="width: 100%" />
                            </a-form-item>
                        </a-col>

                        <a-col :xs="24" :lg="12">
                            <a-form-item
                                :label="
                                    $t('vehicles.licensePlate') ||
                                    'License Plate'
                                "
                                name="license_plate">
                                <a-input
                                    v-model:value="formState.license_plate"
                                    :placeholder="
                                        $t(
                                            'vehicles.licensePlatePlaceholder'
                                        ) || 'e.g., ABC-1234'
                                    "
                                    size="large" />
                            </a-form-item>
                        </a-col>
                    </a-row>

                    <a-row :gutter="24">
                        <a-col :xs="24" :lg="12">
                            <a-form-item
                                :label="$t('vehicles.vin') || 'VIN'"
                                name="vin">
                                <a-input
                                    v-model:value="formState.vin"
                                    :placeholder="
                                        $t('vehicles.vinPlaceholder') ||
                                        'Vehicle Identification Number'
                                    "
                                    size="large" />
                            </a-form-item>
                        </a-col>

                        <a-col :xs="24" :lg="12">
                            <a-form-item
                                :label="
                                    $t('vehicles.mileage') || 'Mileage (km)'
                                "
                                name="mileage">
                                <a-input-number
                                    v-model:value="formState.mileage"
                                    :placeholder="
                                        $t('vehicles.mileagePlaceholder') ||
                                        'e.g., 50000'
                                    "
                                    :min="0"
                                    size="large"
                                    style="width: 100%" />
                            </a-form-item>
                        </a-col>
                    </a-row>

                    <a-row :gutter="24">
                        <a-col :xs="24">
                            <a-form-item
                                :label="$t('vehicles.client') || 'Client'"
                                name="client_id">
                                <a-select
                                    v-model:value="formState.client_id"
                                    :options="clientOptions"
                                    :placeholder="
                                        $t('vehicles.clientPlaceholder') ||
                                        'Select a client (optional)'
                                    "
                                    size="large"
                                    show-search
                                    allow-clear
                                    :filter-option="
                                        (input, option) =>
                                            option.label
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                    "
                                    :loading="clientsQuery.isLoading.value" />
                            </a-form-item>
                        </a-col>
                    </a-row>

                    <div class="form-actions">
                        <a-space :size="12">
                            <a-button @click="handleCancel" size="large">
                                <template #icon><CloseOutlined /></template>
                                {{ $t("common.cancel") || "Cancel" }}
                            </a-button>
                            <a-button
                                type="primary"
                                @click="handleSubmit"
                                :loading="loading"
                                size="large">
                                <template #icon><SaveOutlined /></template>
                                {{
                                    isEdit
                                        ? $t("common.update") || "Update"
                                        : $t("common.create") || "Create"
                                }}
                            </a-button>
                        </a-space>
                    </div>
                </a-form>
            </a-spin>
        </a-card>
    </div>
</template>

<style scoped lang="scss">
.vehicle-form-container {
    // padding: 24px;
    // background: #f5f5f5;
    min-height: 100vh;
}

.form-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    // max-width: 1200px;
    margin: 0 auto;

    :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
        padding: 20px 24px;
    }

    :deep(.ant-card-body) {
        padding: 32px;
    }
}

.card-header {
    .card-title {
        font-size: 20px;
        font-weight: 600;
        color: #262626;
    }
}

.vehicle-form {
    :deep(.ant-form-item-label > label) {
        font-weight: 500;
        color: #262626;
    }

    :deep(.ant-input),
    :deep(.ant-input-number),
    :deep(.ant-select-selector) {
        border-radius: 8px;

        &:hover {
            border-color: #40a9ff;
        }

        &:focus,
        &.ant-input-number-focused,
        &.ant-select-focused {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }
    }

    :deep(.ant-input-number) {
        width: 100%;
    }
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;

    .ant-btn {
        border-radius: 8px;
        height: 40px;
        padding: 0 24px;
        font-weight: 500;

        &.ant-btn-primary {
            box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);

            &:hover {
                box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
                transform: translateY(-1px);
            }
        }

        transition: all 0.3s ease;
    }
}

:deep(.ant-spin-container) {
    min-height: 400px;
}
</style>
