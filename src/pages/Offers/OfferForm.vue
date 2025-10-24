<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { useCreateOffer, useUpdateOffer } from "@/api/offers/mutations";
import { usePartsCatalog, useServicesCatalog, useOfferDetails } from "@/api/offers/queries";
import { useCreatePartMutation } from "@/api/parts/mutations";
import { useCreateServiceMutation } from "@/api/services/mutations";
import {
    SaveOutlined,
    CloseOutlined,
    PlusOutlined,
    DeleteOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons-vue";
import { RuleObject } from "ant-design-vue/es/form";
import type { SelectValue } from "ant-design-vue/es/select";
import { useClientsQuery } from "@/api/clients/queries";
import { useGlobalState } from "@/composables/useGlobalState";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const { user } = useGlobalState();

// Get current admin ID
const currentAdminId = computed<string | null>(() => user.value?.id ?? null);

// Check if we're in edit mode
const isEditMode = computed(() => !!route.params.id);
const offerId = computed(() => route.params.id as string);

const createMutation = useCreateOffer();
const updateMutation = useUpdateOffer();
const createPartMutation = useCreatePartMutation();
const createServiceMutation = useCreateServiceMutation();

const formRef = ref();
const formState = ref({
    title: "",
    description: "",
    client_id: null as string | null,
    labor_cost: 0,
});

const parts = ref<
    Array<{ name: string; part_id?: string; quantity: number; price: number }>
>([]);
const services = ref<
    Array<{ name: string; service_id?: string; price: number }>
>([]);

// Modal state for adding new parts
const showAddPartModal = ref(false);
const newPartForm = ref({
    name: "",
    brand: "",
    oem_code: "",
    price: 0,
});
const newPartFormRef = ref();

// Modal state for adding new services
const showAddServiceModal = ref(false);
const newServiceForm = ref({
    name: "",
    default_price: 0,
});
const newServiceFormRef = ref();

// Fetch clients
const clientsQuery = useClientsQuery();

// Fetch parts catalog
const partsQuery = usePartsCatalog();

// Fetch services catalog
const servicesQuery = useServicesCatalog();

// Fetch offer details for editing
const offerQuery = useOfferDetails(offerId.value);

// Populate form with existing offer data when in edit mode
watch(
    () => offerQuery.data.value,
    (offer) => {
        if (isEditMode.value && offer) {
            formState.value = {
                title: offer.title,
                description: offer.description || "",
                client_id: offer.client_id,
                labor_cost: offer.labor_cost || 0,
            };

            // Populate parts
            if (offer.parts && offer.parts.length > 0) {
                parts.value = offer.parts.map(part => ({
                    name: part.name,
                    part_id: part.part_id || undefined,
                    quantity: part.quantity,
                    price: part.price,
                }));
            }

            // Populate services
            if (offer.services && offer.services.length > 0) {
                services.value = offer.services.map(service => ({
                    name: service.name,
                    service_id: service.service_id || undefined,
                    price: service.price,
                }));
            }
        }
    },
    { immediate: true }
);

const clientOptions = computed(() =>
    (clientsQuery.data.value || []).map((client: any) => ({
        label: client.name,
        value: client.id,
    }))
);

const partsOptions = computed(() =>
    (partsQuery.data.value || []).map((part: any) => ({
        label: `${part.name} ${part.brand ? `(${part.brand})` : ""}`,
        value: part.id,
        price: part.price,
        name: part.name,
    }))
);

const servicesOptions = computed(() =>
    (servicesQuery.data.value || []).map((service: any) => ({
        label: service.name,
        value: service.id,
        price: service.default_price,
        name: service.name,
    }))
);

const rules = computed<Record<string, RuleObject[]>>(() => ({
    title: [
        {
            required: true,
            message: t("validation.required", { field: "Title" }),
            trigger: "blur",
        },
    ],
    client_id: [
        {
            required: true,
            message: t("validation.required", { field: "Client" }),
            trigger: "change",
        },
    ],
}));

const addPart = () => {
    parts.value.push({ name: "", quantity: 1, price: 0 });
};

const removePart = (index: number) => {
    parts.value.splice(index, 1);
};

const onPartSelect = (partId: SelectValue, index: number) => {
    if (partId == null) return;
    const id = String(partId);
    const part = partsOptions.value.find((p) => String(p.value) === id);
    if (part) {
        parts.value[index].part_id = id;
        parts.value[index].name = part.name;
        parts.value[index].price = part.price || 0;
    }
};

const addService = () => {
    services.value.push({ name: "", price: 0 });
};

const removeService = (index: number) => {
    services.value.splice(index, 1);
};

const onServiceSelect = (serviceId: SelectValue, index: number) => {
    if (serviceId == null) return;
    const id = String(serviceId);
    const service = servicesOptions.value.find((s) => String(s.value) === id);
    if (service) {
        services.value[index].service_id = id;
        services.value[index].name = service.name;
        services.value[index].price = service.price || 0;
    }
};

const totalAmount = computed(() => {
    const partsTotal = parts.value.reduce(
        (sum, part) => sum + part.price * part.quantity,
        0
    );
    const servicesTotal = services.value.reduce(
        (sum, service) => sum + service.price,
        0
    );
    return partsTotal + servicesTotal + (formState.value.labor_cost || 0);
});

const loading = computed(() => 
    isEditMode.value 
        ? updateMutation.isPending.value 
        : createMutation.isPending.value
);

const handleSubmit = async () => {
    try {
        await formRef.value.validate();

        if (!currentAdminId.value) {
            message.error(
                t("offers.notAuthenticated") ||
                    "You must be signed in to create an offer"
            );
            return;
        }

        if (parts.value.length === 0 && services.value.length === 0) {
            message.warning(
                t("offers.addItemsWarning") ||
                    "Please add at least one part or service"
            );
            return;
        }

        if (isEditMode.value) {
            // Update existing offer
            const offerData = {
                title: formState.value.title,
                description: formState.value.description,
                labor_cost: formState.value.labor_cost,
                total_amount: totalAmount.value,
            };

            await updateMutation.mutateAsync({
                offerId: offerId.value,
                offerData,
                parts: parts.value,
                services: services.value,
            });

            message.success(
                t("offers.updateSuccess") || "Offer updated successfully"
            );
        } else {
            // Create new offer
            const offerData = {
                admin_id: currentAdminId.value,
                client_id: formState.value.client_id,
                title: formState.value.title,
                description: formState.value.description,
                labor_cost: formState.value.labor_cost,
                total_amount: totalAmount.value,
                status: "pending" as const,
            };

            const offer = await createMutation.mutateAsync(offerData);

            // Create offer parts
            if (parts.value.length > 0) {
                const { error: partsError } = await supabase
                    .from("offer_parts")
                    .insert(
                        parts.value.map((part) => ({
                            offer_id: offer.id,
                            part_id: part.part_id,
                            name: part.name,
                            quantity: part.quantity,
                            price: part.price,
                        }))
                    );
                if (partsError) throw partsError;
            }

            // Create offer services
            if (services.value.length > 0) {
                const { error: servicesError } = await supabase
                    .from("offer_services")
                    .insert(
                        services.value.map((service) => ({
                            offer_id: offer.id,
                            service_id: service.service_id,
                            name: service.name,
                            price: service.price,
                        }))
                    );
                if (servicesError) throw servicesError;
            }

            message.success(
                t("offers.createSuccess") || "Offer created successfully"
            );
        }

        router.push("/offers");
    } catch (error) {
        console.error("Form submission failed:", error);
        message.error(
            isEditMode.value 
                ? (t("offers.updateError") || "Failed to update offer")
                : (t("offers.createError") || "Failed to create offer")
        );
    }
};

const handleCancel = () => {
    router.push("/offers");
};

// New part modal functions
const showAddPartModalHandler = () => {
    showAddPartModal.value = true;
};

const handleAddPartCancel = () => {
    showAddPartModal.value = false;
    newPartForm.value = {
        name: "",
        brand: "",
        oem_code: "",
        price: 0,
    };
};

const handleAddPartSubmit = async () => {
    try {
        await newPartFormRef.value.validate();
        
        await createPartMutation.mutateAsync({
            name: newPartForm.value.name,
            brand: newPartForm.value.brand || null,
            oem_code: newPartForm.value.oem_code || null,
            price: newPartForm.value.price || null,
        });

        message.success(
            t("parts.createSuccess") || "Part created successfully"
        );
        
        // Close modal and reset form
        handleAddPartCancel();
        
        // The parts catalog will be automatically refreshed due to query invalidation
    } catch (error) {
        console.error("Failed to create part:", error);
        message.error(
            t("parts.createError") || "Failed to create part"
        );
    }
};

const newPartRules = computed<Record<string, RuleObject[]>>(() => ({
    name: [
        {
            required: true,
            message: t("validation.required", { field: "Part Name" }),
            trigger: "blur",
        },
    ],
}));

// New service modal functions
const showAddServiceModalHandler = () => {
    showAddServiceModal.value = true;
};

const handleAddServiceCancel = () => {
    showAddServiceModal.value = false;
    newServiceForm.value = {
        name: "",
        default_price: 0,
    };
};

const handleAddServiceSubmit = async () => {
    try {
        await newServiceFormRef.value.validate();
        
        await createServiceMutation.mutateAsync({
            name: newServiceForm.value.name,
            default_price: newServiceForm.value.default_price || null,
        });

        message.success(
            t("services.createSuccess") || "Service created successfully"
        );
        
        // Close modal and reset form
        handleAddServiceCancel();
        
        // The services catalog will be automatically refreshed due to query invalidation
    } catch (error) {
        console.error("Failed to create service:", error);
        message.error(
            t("services.createError") || "Failed to create service"
        );
    }
};

const newServiceRules = computed<Record<string, RuleObject[]>>(() => ({
    name: [
        {
            required: true,
            message: t("validation.required", { field: "Service Name" }),
            trigger: "blur",
        },
    ],
}));
</script>

<template>
    <div class="offer-form-container">
        <a-spin :spinning="isEditMode && offerQuery.isLoading.value">
            <a-card :bordered="false" class="form-card">
            <template #title>
                <div class="card-header">
                    <span class="card-title">{{
                        isEditMode 
                            ? ($t("offers.edit") || "Edit Offer")
                            : ($t("offers.new") || "New Offer")
                    }}</span>
                </div>
            </template>

            <a-form
                ref="formRef"
                :model="formState"
                :rules="rules"
                layout="vertical"
                class="offer-form">
                <!-- Basic Information -->
                <div class="form-section">
                    <h3 class="section-title">
                        {{ $t("offers.basicInfo") || "Basic Information" }}
                    </h3>

                    <a-row :gutter="24">
                        <a-col :xs="24" :lg="12">
                            <a-form-item
                                :label="$t('offers.offerTitle') || 'Title'"
                                name="title">
                                <a-input
                                    v-model:value="formState.title"
                                    :placeholder="
                                        $t('offers.titlePlaceholder') ||
                                        'e.g., Engine Repair Quote'
                                    "
                                    size="large" />
                            </a-form-item>
                        </a-col>

                        <a-col :xs="24" :lg="12">
                            <a-form-item
                                :label="$t('offers.client') || 'Client'"
                                name="client_id">
                                <a-select
                                    v-model:value="formState.client_id"
                                    :options="clientOptions"
                                    :placeholder="
                                        $t('offers.clientPlaceholder') ||
                                        'Select a client'
                                    "
                                    size="large"
                                    show-search
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

                    <a-row :gutter="24">
                        <a-col :xs="24">
                            <a-form-item
                                :label="
                                    $t('offers.description') || 'Description'
                                "
                                name="description">
                                <a-textarea
                                    v-model:value="formState.description"
                                    :placeholder="
                                        $t('offers.descriptionPlaceholder') ||
                                        'Detailed description of the work to be done'
                                    "
                                    :rows="4"
                                    size="large" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </div>

                <!-- Parts Section -->
                <div class="form-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            {{ $t("offers.parts") || "Parts" }}
                        </h3>
                        <a-button type="dashed" @click="addPart">
                            <template #icon><PlusOutlined /></template>
                            {{ $t("offers.addPart") || "Add Part" }}
                        </a-button>
                    </div>

                    <div v-if="parts.length > 0" class="items-list">
                        <a-card
                            v-for="(part, index) in parts"
                            :key="index"
                            class="item-card"
                            size="small">
                            <a-row :gutter="16" align="middle">
                                <a-col :xs="24" :md="10">
                                    <a-select
                                        v-model:value="part.part_id"
                                        :options="partsOptions"
                                        placeholder="Select part"
                                        show-search
                                        allow-clear
                                        @change="(val) => onPartSelect(val, index)"
                                        :filter-option="(input, option) => option.label.toLowerCase().includes(input.toLowerCase())"
                                        :loading="partsQuery.isLoading.value"
                                        style="width: 100%">
                                        <template #dropdownRender="{ menuNode: menu }">
                                            <div>
                                                <component :is="menu" />
                                                <a-divider style="margin: 8px 0" />
                                                <div style="padding: 8px 12px">
                                                    <a-button type="dashed" block @click="showAddPartModalHandler">
                                                        <template #icon><PlusCircleOutlined /></template>
                                                        {{ $t("offers.addNewPart") || "Add New Part" }}
                                                    </a-button>
                                                </div>
                                            </div>
                                        </template>
                                    </a-select>
                                </a-col>
                                <a-col :xs="12" :md="4">
                                    <a-input-number
                                        v-model:value="part.quantity"
                                        :min="1"
                                        :placeholder="
                                            $t('offers.quantity') || 'Qty'
                                        "
                                        style="width: 100%" />
                                </a-col>
                                <a-col :xs="12" :md="6">
                                    <a-input-number
                                        v-model:value="part.price"
                                        :min="0"
                                        :precision="2"
                                        :placeholder="
                                            $t('offers.price') || 'Price'
                                        "
                                        prefix="€"
                                        style="width: 100%" />
                                </a-col>
                                <a-col :xs="24" :md="3">
                                    <div class="item-total">
                                        €{{
                                            (
                                                part.price * part.quantity
                                            ).toFixed(2)
                                        }}
                                    </div>
                                </a-col>
                                <a-col :xs="24" :md="1">
                                    <a-button
                                        type="text"
                                        danger
                                        @click="removePart(index)"
                                        :icon="h(DeleteOutlined)" />
                                </a-col>
                            </a-row>
                        </a-card>
                    </div>
                </div>

                <!-- Services Section -->
                <div class="form-section">
                    <div class="section-header">
                        <h3 class="section-title">
                            {{ $t("offers.services") || "Services" }}
                        </h3>
                        <a-button type="dashed" @click="addService">
                            <template #icon><PlusOutlined /></template>
                            {{ $t("offers.addService") || "Add Service" }}
                        </a-button>
                    </div>

                    <div v-if="services.length > 0" class="items-list">
                        <a-card
                            v-for="(service, index) in services"
                            :key="index"
                            class="item-card"
                            size="small">
                            <a-row :gutter="16" align="middle">
                                <a-col :xs="24" :md="14">
                                    <a-select
                                        v-model:value="service.service_id"
                                        :options="servicesOptions"
                                        :placeholder="$t('offers.selectService') || 'Select service'"
                                        show-search
                                        allow-clear
                                        @change="(val) => onServiceSelect(val, index)"
                                        :filter-option="(input, option) => option.label.toLowerCase().includes(input.toLowerCase())"
                                        :loading="servicesQuery.isLoading.value"
                                        style="width: 100%">
                                        <template #dropdownRender="{ menuNode: menu }">
                                            <div>
                                                <component :is="menu" />
                                                <a-divider style="margin: 8px 0" />
                                                <div style="padding: 8px 12px">
                                                    <a-button
                                                        type="dashed"
                                                        block
                                                        @click="showAddServiceModalHandler">
                                                        <template #icon>
                                                            <PlusCircleOutlined /> 
                                                        </template>
                                                        {{ $t("offers.addNewService") || "Add New Service" }}
                                                    </a-button>
                                                </div>
                                            </div>
                                        </template>
                                    </a-select>
                                </a-col>
                                <a-col :xs="12" :md="7">
                                    <a-input-number
                                        v-model:value="service.price"
                                        :min="0"
                                        :precision="2"
                                        :placeholder="
                                            $t('offers.price') || 'Price'
                                        "
                                        prefix="€"
                                        style="width: 100%" />
                                </a-col>
                                <a-col :xs="12" :md="2">
                                    <div class="item-total">
                                        €{{ Number(service.price).toFixed(2) }}
                                    </div>
                                </a-col>
                                <a-col :xs="24" :md="1">
                                    <a-button
                                        type="text"
                                        danger
                                        @click="removeService(index)"
                                        :icon="h(DeleteOutlined)" />
                                </a-col>
                            </a-row>
                        </a-card>
                    </div>
                </div>

                <!-- Labor Cost -->
                <div class="form-section">
                    <h3 class="section-title">
                        {{ $t("offers.laborCost") || "Labor Cost" }}
                    </h3>
                    <a-row :gutter="24">
                        <a-col :xs="24" :md="12">
                            <a-input-number
                                v-model:value="formState.labor_cost"
                                :min="0"
                                :precision="2"
                                :placeholder="
                                    $t('offers.laborCostPlaceholder') ||
                                    'Enter labor cost'
                                "
                                prefix="€"
                                size="large"
                                style="width: 100%" />
                        </a-col>
                    </a-row>
                </div>

                <!-- Total -->
                <div class="total-section">
                    <div class="total-container">
                        <span class="total-label">{{
                            $t("offers.totalAmount") || "Total Amount"
                        }}</span>
                        <span class="total-value"
                            >€{{ totalAmount.toFixed(2) }}</span
                        >
                    </div>
                </div>

                <!-- Actions -->
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
                            {{ isEditMode 
                                ? ($t("common.update") || "Update Offer")
                                : ($t("common.create") || "Create Offer")
                            }}
                        </a-button>
                    </a-space>
                </div>
            </a-form>
        </a-card>
        </a-spin>

        <!-- Add New Part Modal -->
        <a-modal
            v-model:open="showAddPartModal"
            :title="$t('offers.addNewPart') || 'Add New Part'"
            :width="500"
            @ok="handleAddPartSubmit"
            @cancel="handleAddPartCancel"
            :confirm-loading="createPartMutation.isPending.value">
            <a-form
                ref="newPartFormRef"
                :model="newPartForm"
                :rules="newPartRules"
                layout="vertical">
                <a-form-item
                    :label="$t('parts.name') || 'Part Name'"
                    name="name">
                    <a-input
                        v-model:value="newPartForm.name"
                        :placeholder="$t('parts.namePlaceholder') || 'Enter part name'"
                        size="large" />
                </a-form-item>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item
                            :label="$t('parts.brand') || 'Brand'"
                            name="brand">
                            <a-input
                                v-model:value="newPartForm.brand"
                                :placeholder="$t('parts.brandPlaceholder') || 'Enter brand'"
                                size="large" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item
                            :label="$t('parts.oemCode') || 'OEM Code'"
                            name="oem_code">
                            <a-input
                                v-model:value="newPartForm.oem_code"
                                :placeholder="$t('parts.oemCodePlaceholder') || 'Enter OEM code'"
                                size="large" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item
                    :label="$t('parts.price') || 'Price'"
                    name="price">
                    <a-input-number
                        v-model:value="newPartForm.price"
                        :min="0"
                        :precision="2"
                        :placeholder="$t('parts.pricePlaceholder') || 'Enter price'"
                        prefix="€"
                        size="large"
                        style="width: 100%" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Add New Service Modal -->
        <a-modal
            v-model:open="showAddServiceModal"
            :title="$t('offers.addNewService') || 'Add New Service'"
            :width="500"
            @ok="handleAddServiceSubmit"
            @cancel="handleAddServiceCancel"
            :confirm-loading="createServiceMutation.isPending.value">
            <a-form
                ref="newServiceFormRef"
                :model="newServiceForm"
                :rules="newServiceRules"
                layout="vertical">
                <a-form-item
                    :label="$t('services.name') || 'Service Name'"
                    name="name">
                    <a-input
                        v-model:value="newServiceForm.name"
                        :placeholder="$t('services.namePlaceholder') || 'Enter service name'"
                        size="large" />
                </a-form-item>

                <a-form-item
                    :label="$t('services.defaultPrice') || 'Default Price'"
                    name="default_price">
                    <a-input-number
                        v-model:value="newServiceForm.default_price"
                        :min="0"
                        :precision="2"
                        :placeholder="$t('services.defaultPricePlaceholder') || 'Enter default price'"
                        prefix="€"
                        size="large"
                        style="width: 100%" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<style scoped lang="scss">
.offer-form-container {
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

.offer-form {
    :deep(.ant-form-item-label > label) {
        font-weight: 500;
        color: #262626;
    }

    :deep(.ant-input),
    :deep(.ant-input-number),
    :deep(.ant-select-selector),
    :deep(.ant-input-textarea) {
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
}

.form-section {
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid #f0f0f0;

    &:last-of-type {
        border-bottom: none;
    }
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 20px 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .ant-btn-dashed {
        border-radius: 8px;

        &:hover {
            border-color: #1890ff;
            color: #1890ff;
        }
    }
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.item-card {
    border-radius: 8px;
    border: 1px solid #f0f0f0;

    :deep(.ant-card-body) {
        padding: 16px;
    }

    .item-total {
        font-weight: 600;
        color: #52c41a;
        font-size: 15px;
        text-align: right;
    }
}

.total-section {
    margin: 32px 0 24px 0;
}

.total-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
    border-radius: 12px;

    .total-label {
        font-size: 18px;
        font-weight: 600;
        color: #262626;
    }

    .total-value {
        font-size: 28px;
        font-weight: 700;
        color: #1890ff;
    }
}

.form-actions {
    display: flex;
    justify-content: flex-end;
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

@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .ant-btn-dashed {
            width: 100%;
        }
    }
}
</style>
