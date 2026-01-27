<template>
  <AtomsModalBase
    :is-open="modalManager.isOpen.approval"
    @close="modalManager.closeModal('approval')"
    :close-on-backdrop="false"
    size="extra-small"
  >
    <template #title>
      <span class="credit-approval__warning-icon">
        <img src="@/src/assets/warning.svg" width="20" alt="Warning" />
      </span>
    </template>

    <div class="credit-approval">
      <h5 class="credit-approval__title">
        Seguro que quieres aprobar esta solicitud?
      </h5>

      <p class="credit-approval__description">
        Para continuar por favor adjunta el pagaré con las condiciones de pago
        para el paciente:
      </p>

      <div class="credit-approval__file-upload">
        <input
          type="file"
          id="documentUpload"
          ref="fileInputRef"
          @change="handleFileChange"
          accept=".pdf,.doc,.docx"
          class="credit-approval__file-input"
        />
        <label
          for="documentUpload"
          class="credit-approval__file-label"
          :class="{
            'credit-approval__file-label--success': uploadedFile,
          }"
        >
          <div class="credit-approval__file-content">
            <img src="@/src/assets/cloud-upload.svg" width="20" alt="Upload" />
            <span v-if="!uploadedFile">
              Arrastra un archivo o haz click para buscar en tu ordenador
            </span>
            <span v-else class="credit-approval__file-success">
              Documento cargado: {{ uploadedFile.name }}
            </span>
          </div>
          <button
            v-if="uploadedFile"
            @click.stop="handleRemoveFile"
            class="credit-approval__button credit-approval__button--danger-small"
          >
            Eliminar
          </button>
        </label>
        <div
          v-if="fileError"
          class="credit-approval__error credit-approval__error--small"
        >
          {{ fileError }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="credit-approval__actions">
        <button
          class="credit-approval__button credit-approval__button--danger"
          @click="handleGoBack"
          :disabled="isLoading"
        >
          Cancelar
        </button>
        <button
          class="credit-approval__button credit-approval__button--primary"
          @click="handleConfirm"
          :disabled="!uploadedFile || isLoading"
        >
          {{ isLoading ? "Procesando..." : "Continuar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useUserNotification } from "@/composables/api/useNotification";
import { useModalManager } from "@/composables/useModalManager";

interface DocumentFields {
  title: string;
  type: string;
  description: string;
  id_for_table: number | string;
  table: string;
  action_type: string;
  user_id: number | string;
  is_public: number;
}

const config = useRuntimeConfig();
const token = useCookie<string>("token");
const user_info = useCookie<{ id: number | string }>("user_info");

const modalManager = useModalManager();
const { createUserNotification } = useUserNotification();
const fileInputRef = ref<HTMLInputElement | null>(null);
const fileError = ref<string>("");
const isLoading = ref<boolean>(false);

const uploadedFile = computed({
  get: () => modalManager.getSharedData<File | null>("uploadedFile"),
  set: (value: File | null) =>
    modalManager.setSharedData("uploadedFile", value),
});

const approvedAmount = computed(() =>
  modalManager.getSharedData<string>("approvedAmount"),
);

const description = computed(() =>
  modalManager.getSharedData<string>("description"),
);

const handleFileChange = (event: Event): void => {
  event.stopPropagation();
  event.preventDefault();

  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!validTypes.includes(file.type)) {
    fileError.value = "Solo se aceptan archivos PDF o Word";
    uploadedFile.value = null;
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    fileError.value = "El archivo no puede exceder 5MB";
    uploadedFile.value = null;
    return;
  }

  uploadedFile.value = file;
  fileError.value = "";
};

const handleRemoveFile = (): void => {
  uploadedFile.value = null;
  fileError.value = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const handleConfirm = async (): Promise<void> => {
  if (!uploadedFile.value) {
    fileError.value = "Debe subir un documento para continuar";
    return;
  }

  if (!modalManager.credit.value) return;

  try {
    isLoading.value = true;
    const formData = new FormData();
    formData.append("file", uploadedFile.value);

    const documentFields: DocumentFields = {
      title: `Credit_Document_${modalManager.credit.value.id}`,
      type: "DOC",
      description: description.value || "",
      id_for_table: modalManager.credit.value.id,
      table: "APPOINTMENT_CREDIT",
      action_type: "PRIVATE_CONTRACT",
      user_id: user_info.value?.id || "",
      is_public: 0,
    };

    formData.append("fields", JSON.stringify(documentFields));

    const documentResponse = await fetch(
      `${config.public.API_BASE_URL}/document/add`,
      {
        method: "POST",
        headers: { Authorization: token.value || "" },
        body: formData,
      },
    );

    if (!documentResponse.ok) {
      throw new Error("Error al subir el documento");
    }

    const documentResult = await documentResponse.json();
    const documentCode = documentResult.data?.code;

    if (!documentCode) {
      throw new Error("No se pudo obtener el código del documento");
    }

    const creditStatusCode =
      Number(approvedAmount.value) &&
      Number(approvedAmount.value) <
        parseFloat(modalManager.credit.value.requested_amount)
        ? "APPROVED_PERCENTAGE"
        : "APPROVED";

    const { data, error } = await useFetch(
      `${config.public.API_BASE_URL}/appointmentcredit/edit?id=${modalManager.credit.value.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: token.value || "",
          "Content-Type": "application/json",
        },
        body: {
          credit_status_code: creditStatusCode,
          approved_amount: approvedAmount.value,
          credit_observations: description.value || "Solicitud Aprobada",
          pagare_file_code: documentCode,
        },
      },
    );

    if (error.value) {
      throw new Error(
        (error.value as any).data?.info || "Error al aprobar el crédito",
      );
    }

    const creditCode =
      modalManager.credit.value.appointment?.appointment_qr_code ||
      `CREDIT-${modalManager.credit.value.id}`;

    const customerName =
      modalManager.credit.value.appointment?.customer?.name || "Cliente";
    const customerId = modalManager.credit.value.appointment?.customer?.id;

    if (customerId) {
      const notificationPayload = {
        notification: "credit_approved",
        user_send: user_info.value?.id?.toString() || "",
        user_receive: customerId.toString(),
        action_url: `${window.location.origin}/citas/${modalManager.credit.value.appointment?.id}`,
        payload: JSON.stringify({
          credit_code: creditCode,
          approved_amount: approvedAmount.value,
          user: customerName,
          credit_status:
            creditStatusCode === "APPROVED"
              ? "Aprobado"
              : "Aprobado Parcialmente",
        }),
        is_read: false,
      };

      await createUserNotification(notificationPayload);
    }

    if (modalManager.credit.value) {
      modalManager.credit.value.approved_amount = approvedAmount.value;
    }

    if (modalManager.refreshCredits.value) {
      await modalManager.refreshCredits.value();
    }

    modalManager.closeModal("approval");
    modalManager.openModal("success");
  } catch (error: any) {
    fileError.value = error.message || "Error al procesar la aprobación";
  } finally {
    isLoading.value = false;
  }
};

const handleGoBack = () => {
  modalManager.closeModal("approval");
  modalManager.openModal("details");
};
</script>

<style lang="scss" scoped>
.credit-approval {
  width: 100%;
  padding: 0 24px;

  &__warning-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 50%;
    background-color: #fff3cd;
    color: #ffc107;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  &__title {
    max-width: 280px;
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    letter-spacing: 0;
    color: $color-foreground;
  }

  &__description {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;
    color: #6d758f;
  }

  &__file-upload {
    border: 2px solid #dee2e6;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;

    &:hover {
      border-color: #0d6efd;
      background-color: rgba(13, 110, 253, 0.05);
    }
  }

  &__file-input {
    display: none;
  }

  &__file-label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background-color: #ebecf7;
    color: #344054;
    padding: 0.75rem;
    cursor: pointer;
    border-radius: 0.375rem;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;

    &--success {
      border: 1px solid #198754;
    }
  }

  &__file-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__file-success {
    color: #198754;
  }

  &__error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;

    &--small {
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;

    .credit-approval__button {
      flex: 1;
    }
  }

  &__button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;

    &:disabled {
      cursor: not-allowed;
    }

    &--primary {
      @include primary-button;
    }

    &--danger {
      @include danger-button;
    }

    &--danger-small {
      @include danger-button;
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  }
}
</style>
