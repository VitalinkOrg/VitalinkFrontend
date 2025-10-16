<template>
  <div class="credit-modal__content">
    <AseguradorasModalesCreditDetails
      ref="creditDetailsRef"
      :disabled="credit.credit_status.code !== 'REQUIRED'"
      :credit="credit"
      :approved-amount="approvedAmount"
      :description="description"
      :amount-error="amountError"
      :proforma-guardado="proformaGuardado"
      @update:approved-amount="approvedAmount = $event"
      @update:description="description = $event"
      @next-step="handleOpenCreditApproval"
      @cancel-step="handleOpenCreditRejectionRef"
    />

    <AseguradorasModalesCreditApproval
      ref="creditApprovalRef"
      :uploaded-file="uploadedFile"
      :file-error="fileError"
      @file-uploaded="handleFileUpload"
      @file-removed="removeFile"
      @back="handleOpencreditDetailsRef"
      @confirm="confirmAppointment"
    />

    <AseguradorasModalesCreditConfirmation
      ref="creditConfirmationRef"
      :credit="credit"
      :approved-amount="approvedAmount"
      :uploaded-file="uploadedFile"
      @close="handleCloseModal"
    />

    <AseguradorasModalesCreditRejection
      ref="creditRejectionRef"
      :rejection-reason="rejectionReason"
      @update:rejection-reason="rejectionReason = $event"
      @back="handleOpencreditDetailsRef"
      @confirm="cancelAppointment"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Credit } from "~/types";

interface Props {
  credit: Credit;
  step?: number;
}

interface Emits {
  (e: "update:step", value: number): void;
  (e: "close-modal"): void;
  (e: "approve-credit", payload: ApprovePayload): void;
  (e: "reject-credit", payload: RejectPayload): void;
  (e: "refresh"): void;
}

interface ApprovePayload {
  creditId: number | string;
  approvedAmount: number;
  document: string;
  comments: string;
  documentCode: string;
}

interface RejectPayload {
  creditId: number | string;
  reason: string;
}

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

const creditApprovalRef = ref();
const creditConfirmationRef = ref();
const creditRejectionRef = ref();
const creditDetailsRef = ref();

const props = withDefaults(defineProps<Props>(), {
  step: 1,
});

console.log(props.credit);

const emit = defineEmits<Emits>();

const approvedAmount = ref<string | null>(null);
const description = ref<string>("");
const uploadedFile = ref<File | null>(null);
const rejectionReason = ref<string>("");
const fileError = ref<string>("");
const amountError = ref<string>("");
const isOpen = ref<boolean>(false);
const localStep = ref<number>(props.step);
const proformaGuardado = ref<boolean>(false);

const handleOpenModal = () => {
  isOpen.value = true;
};

const handleCloseModal = () => {
  isOpen.value = false;
};

watch(
  () => props.step,
  (newVal: number) => {
    localStep.value = newVal;
  }
);

watch(
  () => props.credit,
  (newCredit: Credit | null) => {
    if (newCredit) {
      approvedAmount.value = newCredit.requested_amount;
    }
  }
);

watch(
  () => approvedAmount.value,
  (newVal: string | null) => {
    if (!newVal) {
      amountError.value = "El monto es requerido";
      return;
    }

    if (
      props.credit?.requested_amount &&
      newVal > props.credit.requested_amount
    ) {
      amountError.value = `El monto no puede exceder $${props.credit.requested_amount}`;
    } else if (Number(newVal) <= 0) {
      amountError.value = "El monto debe ser mayor a 0";
    } else {
      amountError.value = "";
    }
  }
);

const handleFileUpload = (file: File): void => {
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!validTypes.includes(file.type)) {
    fileError.value = "Solo se aceptan archivos PDF o Word";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    fileError.value = "El archivo no puede exceder 5MB";
    return;
  }

  uploadedFile.value = file;
  fileError.value = "";
};

const removeFile = (): void => {
  uploadedFile.value = null;
};

const confirmAppointment = async (): Promise<void> => {
  if (!uploadedFile.value) {
    fileError.value = "Debe subir un documento para continuar";
    return;
  }

  if (!props.credit) return;

  try {
    const formData = new FormData();
    formData.append("file", uploadedFile.value);

    const documentFields: DocumentFields = {
      title: `Credit_Document_${props.credit.id}`,
      type: "DOC",
      description: description.value || "",
      id_for_table: props.credit.id,
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
      }
    );

    if (!documentResponse.ok) {
      throw new Error("Error al subir el documento");
    }

    const documentResult = await documentResponse.json();
    const documentCode = documentResult.data?.code;

    if (!documentCode) {
      throw new Error("No se pudo obtener el código del documento");
    }

    const { data, error } = await useFetch(
      `${config.public.API_BASE_URL}/appointmentcredit/edit?id=${props.credit.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: token.value || "",
          "Content-Type": "application/json",
        },
        body: {
          credit_status_code:
            Number(approvedAmount.value) &&
            Number(approvedAmount.value) <
              parseFloat(props.credit.requested_amount)
              ? "APPROVED_PERCENTAGE"
              : "APPROVED",
          approved_amount: approvedAmount.value,
          credit_observations: description.value || "Solicitud Aprobada",
          pagare_file_code: documentCode,
        },
      }
    );

    if (error.value) {
      throw new Error(
        (error.value as any).data?.info || "Error al aprobar el crédito"
      );
    }

    creditConfirmationRef.value?.handleCloseModal();
    handleOpenCreditConfirmation();
    emit("refresh");
    emit("approve-credit", {
      creditId: props.credit.id,
      approvedAmount: Number(approvedAmount.value) || 0,
      document: uploadedFile.value.name,
      comments: description.value,
      documentCode: documentCode,
    });
  } catch (error: any) {
    fileError.value = error.message || "Error al procesar la aprobación";
  }
};

const cancelAppointment = async (): Promise<void> => {
  if (!rejectionReason.value || !props.credit) return;

  const { data, error } = await useFetch(
    `${config.public.API_BASE_URL}/appointmentcredit/edit?id=${props.credit.id}`,
    {
      method: "PUT",
      headers: { Authorization: token.value || "" },
      body: {
        credit_status_code: "REJECTED",
      },
    }
  );

  if (data.value) {
    emit("refresh");
    emit("reject-credit", {
      creditId: props.credit.id,
      reason: rejectionReason.value,
    });
  }

  handleCloseModal();
};

const handleOpencreditDetailsRef = () => {
  creditDetailsRef.value?.handleOpenModal();
};

const handleOpenCreditApproval = () => {
  creditApprovalRef.value?.handleOpenModal();
};

const handleOpenCreditConfirmation = () => {
  creditConfirmationRef.value?.handleOpenModal();
};

const handleOpenCreditRejectionRef = () => {
  creditRejectionRef.value?.handleOpenModal();
};
</script>

<style lang="scss" scoped>
.credit-modal {
  &__button {
    &--outline {
      @include outline-button;
      border-radius: 8px;
      border-width: 1px;
      padding: 8px 14px;
      gap: 8px;
      opacity: 1;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0;
      text-wrap: nowrap;
    }
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}

%table-base {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

%table-row {
  border: none;
}

%table-label {
  padding: 0.5rem;
  color: #6c757d;
  vertical-align: top;
}

%table-value {
  padding: 0.5rem;
}

%input-base {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;

  &:focus {
    color: #212529;
    background-color: #fff;
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }
}

%btn-base {
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
    pointer-events: none;
    opacity: 0.65;
  }
}

%btn-primary {
  @extend %btn-base;
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;

  &:hover:not(:disabled) {
    background-color: #0b5ed7;
    border-color: #0a58ca;
  }
}

%btn-danger {
  @extend %btn-base;
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;

  &:hover:not(:disabled) {
    background-color: #bb2d3b;
    border-color: #b02a37;
  }
}

%btn-danger-outline {
  @extend %btn-base;
  color: #dc3545;
  background-color: transparent;
  border-color: #dc3545;

  &:hover:not(:disabled) {
    color: #fff;
    background-color: #dc3545;
    border-color: #dc3545;
  }
}

%btn-dark-outline {
  @extend %btn-base;
  color: #212529;
  background-color: transparent;
  border-color: #212529;

  &:hover:not(:disabled) {
    color: #fff;
    background-color: #212529;
    border-color: #212529;
  }
}

%error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

%title-base {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

%description-base {
  color: #6c757d;
  margin-bottom: 1rem;
}
</style>
