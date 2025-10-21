<template>
  <button class="credit-modal__button--outline" @click="handleOpenModal">
    Ver Detalles
  </button>

  <AtomsModalBase
    :is-open="isOpen"
    @close="handleCloseModal"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <div class="credit-modal__content">
      <div class="credit-modal__body">
        <!-- Step 1: Appointment Details -->
        <div v-if="localStep === 1" class="credit-modal__step">
          <h5 class="credit-modal__title">Detalles de la solicitud</h5>
          <table class="credit-modal__table">
            <tbody>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">
                  Información del Paciente:
                </td>
                <td class="credit-modal__table-value">
                  {{ credit.appointment.customer.name }}
                </td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Especialidad:</td>
                <td class="credit-modal__table-value">
                  {{
                    credit.appointment.package.specialty.medical_specialty.name
                  }}
                </td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Procedimiento:</td>
                <td class="credit-modal__table-value">
                  {{ credit.appointment.package?.procedure?.name }}
                </td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Fecha de Solicitud:</td>
                <td class="credit-modal__table-value">
                  {{ formatDate(credit.created_date) }}
                </td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Monto Solicitado:</td>
                <td class="credit-modal__table-value">
                  ₡{{ credit.requested_amount }}
                </td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Monto a Aprobar:</td>
                <td class="credit-modal__table-value">
                  <input
                    type="number"
                    v-model="approvedAmount"
                    :max="credit.requested_amount"
                    class="credit-modal__input"
                    :class="{ 'credit-modal__input--invalid': amountError }"
                  />
                  <div v-if="amountError" class="credit-modal__error">
                    {{ amountError }}
                  </div>
                </td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">
                  Observaciones del Análisis:
                </td>
                <td class="credit-modal__table-value">
                  <textarea
                    v-model="description"
                    class="credit-modal__textarea"
                    rows="3"
                    placeholder="Campo para detallar motivos del ajuste si se aprueba con un monto menor"
                    :disabled="proformaGuardado"
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="credit-modal__actions">
            <button
              class="credit-modal__btn credit-modal__btn--danger-outline"
              @click="localStep = 4"
            >
              Anular Solicitud
            </button>
            <button
              class="credit-modal__btn credit-modal__btn--primary"
              @click="validateAndProceed"
              :disabled="isApproveDisabled"
            >
              Aprobar Solicitud
            </button>
          </div>
        </div>

        <!-- Step 2: Payment Details -->
        <div v-if="localStep === 2" class="credit-modal__step">
          <span class="credit-modal__warning-icon">
            <img src="@/src/assets/warning.svg" width="20" alt="Warning" />
          </span>
          <h5 class="credit-modal__title">Confirmación de aprobación</h5>
          <p class="credit-modal__description">
            Para continuar por favor adjunta el documento de aprobación con las
            condiciones de pago para el paciente:
          </p>

          <div class="credit-modal__file-upload">
            <input
              type="file"
              id="documentUpload"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".pdf,.doc,.docx"
              class="credit-modal__file-input"
            />
            <label
              for="documentUpload"
              class="credit-modal__file-label"
              :class="{ 'credit-modal__file-label--success': uploadedFile }"
            >
              <div class="credit-modal__file-content">
                <img
                  src="@/src/assets/cloud-upload.svg"
                  width="20"
                  alt="Upload"
                />
                <span v-if="!uploadedFile">
                  Arrastra un archivo o haz click para buscar en tu ordenador
                </span>
                <span v-else class="credit-modal__file-success">
                  Documento cargado: {{ uploadedFile.name }}
                </span>
              </div>
              <button
                v-if="uploadedFile"
                @click.stop="removeFile"
                class="credit-modal__btn credit-modal__btn--danger-small"
              >
                Eliminar
              </button>
            </label>
            <div
              v-if="fileError"
              class="credit-modal__error credit-modal__error--small"
            >
              {{ fileError }}
            </div>
          </div>

          <div class="credit-modal__actions credit-modal__actions--split">
            <button
              class="credit-modal__btn credit-modal__btn--dark-outline"
              @click="localStep = 1"
            >
              Cancelar
            </button>
            <button
              class="credit-modal__btn credit-modal__btn--primary"
              @click="confirmAppointment"
              :disabled="!uploadedFile"
            >
              Confirmar Aprobación
            </button>
          </div>
        </div>

        <!-- Step 3: Confirmation -->
        <div v-if="localStep === 3" class="credit-modal__step">
          <span class="credit-modal__success-icon">
            <img src="@/src/assets/check.svg" width="48" alt="Success" />
          </span>
          <h4 class="credit-modal__confirmation-title">¡Solicitud Aprobada!</h4>
          <p class="credit-modal__confirmation-text">
            La solicitud de crédito ha sido aprobada exitosamente
          </p>
          <table class="credit-modal__table">
            <tbody>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Paciente:</td>
                <td class="credit-modal__table-value">
                  {{ credit.appointment.customer.name }}
                </td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Monto Aprobado:</td>
                <td class="credit-modal__table-value">₡{{ approvedAmount }}</td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Documento:</td>
                <td class="credit-modal__table-value">
                  {{ uploadedFile?.name }}
                </td>
              </tr>
              <tr class="credit-modal__table-row">
                <td class="credit-modal__table-label">Fecha de aprobación:</td>
                <td class="credit-modal__table-value">
                  {{ credit.appointment.appointment_credit?.updated_date }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="credit-modal__actions credit-modal__actions--center">
            <button
              class="credit-modal__btn credit-modal__btn--primary"
              @click="handleCloseModal"
            >
              Finalizar
            </button>
          </div>
        </div>

        <!-- Step 4: Cancellation Confirmation -->
        <div v-if="localStep === 4" class="credit-modal__step">
          <img
            src="@/src/assets/trash.svg"
            alt="Alerta"
            class="credit-modal__alert-icon"
          />
          <h5 class="credit-modal__title">
            ¿Seguro que quieres rechazar esta solicitud?
          </h5>
          <p class="credit-modal__description">
            ¿Está seguro de rechazar esta solicitud? Al rechazar, el paciente
            recibirá un voucher de descuento de Vitalink.
          </p>
          <div class="credit-modal__form-group">
            <label for="rejectionReason" class="credit-modal__form-label"
              >Motivo del rechazo:</label
            >
            <textarea
              id="rejectionReason"
              v-model="rejectionReason"
              class="credit-modal__textarea"
              rows="3"
              placeholder="Explique el motivo del rechazo..."
            ></textarea>
          </div>
          <div class="credit-modal__actions credit-modal__actions--split">
            <button
              class="credit-modal__btn credit-modal__btn--dark-outline"
              @click="localStep = 1"
            >
              Volver
            </button>
            <button
              class="credit-modal__btn credit-modal__btn--danger"
              @click="cancelAppointment"
              :disabled="!rejectionReason"
            >
              Confirmar Rechazo
            </button>
          </div>
        </div>
      </div>
    </div>
  </AtomsModalBase>
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
const { getUserInfo } = useUserInfo();

const { formatDate } = useFormat();

const props = withDefaults(defineProps<Props>(), {
  step: 1,
});

const emit = defineEmits<Emits>();

const approvedAmount = ref<string | null>(null);
const description = ref<string>("");
const uploadedFile = ref<File | null>(null);
const rejectionReason = ref<string>("");
const fileError = ref<string>("");
const amountError = ref<string>("");
const fileInput = ref<HTMLInputElement | null>(null);
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

const isApproveDisabled = computed<boolean>(() => {
  return (
    !approvedAmount.value ||
    Number(approvedAmount.value) <= 0 ||
    (props.credit?.requested_amount !== undefined &&
      approvedAmount.value > props.credit.requested_amount)
  );
});

const validateAndProceed = (): void => {
  if (!approvedAmount.value) {
    amountError.value = "El monto es requerido";
    return;
  }

  if (
    props.credit?.requested_amount &&
    approvedAmount.value > props.credit.requested_amount
  ) {
    amountError.value = `El monto no puede exceder $${props.credit.requested_amount}`;
    return;
  }

  if (Number(approvedAmount.value) <= 0) {
    amountError.value = "El monto debe ser mayor a 0";
    return;
  }

  localStep.value = 2;
};

const handleFileUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
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
  }
};

const removeFile = (): void => {
  uploadedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
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
      user_id: getUserInfo().id || "",
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
      console.error("Error approving credit:", error.value);
      throw new Error(
        (error.value as any).data?.info || "Error al aprobar el crédito"
      );
    }

    localStep.value = 3;
    emit("refresh");
    emit("approve-credit", {
      creditId: props.credit.id,
      approvedAmount: Number(approvedAmount.value) || 0,
      document: uploadedFile.value.name,
      comments: description.value,
      documentCode: documentCode,
    });
  } catch (error: any) {
    console.error("Error approving credit:", error);
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

  if (error.value) {
    console.log(error.value, "data");
  }

  handleCloseModal();
};
</script>

<style lang="scss" scoped>
.credit-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.5);

  &--open {
    display: block;
  }

  &__dialog {
    position: relative;
    width: auto;
    margin: 1.75rem auto;
    max-width: 500px;
    display: flex;
    align-items: center;
    min-height: calc(100% - 3.5rem);
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    max-height: calc(100vh - 3.5rem);
    overflow: hidden;
  }

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
    }
  }

  &__header {
    display: flex;
    align-items: center;
    padding: 1rem 1rem 0 1rem;
    border-bottom: none;
  }

  &__close-btn {
    padding: 0.5rem 0.5rem;
    margin: 0 0.5rem 0 0;
    background-color: #f8f9fa;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    position: relative;

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1rem;
      height: 2px;
      background-color: #000;
    }

    &::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    &::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }

    &:hover {
      background-color: #e9ecef;
    }
  }

  &__body {
    flex: 1 1 auto;
    padding: 1rem;
    overflow-y: auto;
  }

  &__step {
    width: 100%;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  &__table {
    width: 100%;
    margin-bottom: 1rem;
    border-collapse: collapse;
  }

  &__table-row {
    border: none;
  }

  &__table-label {
    padding: 0.5rem;
    color: #6c757d;
    vertical-align: top;
  }

  &__table-value {
    padding: 0.5rem;
  }

  &__input {
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

    &--invalid {
      border-color: #dc3545;

      &:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
      }
    }
  }

  &__textarea {
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
    resize: vertical;
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

    &:disabled {
      background-color: #e9ecef;
      opacity: 1;
    }
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
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;

    &--split {
      justify-content: space-between;

      .credit-modal__btn {
        flex: 1;
      }
    }

    &--center {
      justify-content: center;
    }
  }

  &__btn {
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

    &--primary {
      color: #fff;
      background-color: #0d6efd;
      border-color: #0d6efd;

      &:hover:not(:disabled) {
        background-color: #0b5ed7;
        border-color: #0a58ca;
      }
    }

    &--danger {
      color: #fff;
      background-color: #dc3545;
      border-color: #dc3545;

      &:hover:not(:disabled) {
        background-color: #bb2d3b;
        border-color: #b02a37;
      }
    }

    &--danger-outline {
      color: #dc3545;
      background-color: transparent;
      border-color: #dc3545;

      &:hover:not(:disabled) {
        color: #fff;
        background-color: #dc3545;
        border-color: #dc3545;
      }
    }

    &--dark-outline {
      color: #212529;
      background-color: transparent;
      border-color: #212529;

      &:hover:not(:disabled) {
        color: #fff;
        background-color: #212529;
        border-color: #212529;
      }
    }

    &--danger-small {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      color: #dc3545;
      background-color: transparent;
      border-color: #dc3545;

      &:hover {
        color: #fff;
        background-color: #dc3545;
        border-color: #dc3545;
      }
    }
  }

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

  &__description {
    color: #6c757d;
    margin-bottom: 1rem;
  }

  &__file-upload {
    border: 2px dashed #dee2e6;
    border-radius: 0.375rem;
    padding: 1rem;
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
    gap: 0.5rem;
    background-color: #cff4fc;
    padding: 0.75rem;
    cursor: pointer;
    border-radius: 0.375rem;

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

  &__success-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  &__confirmation-title {
    font-size: 1.5rem;
    color: #0d6efd;
    text-align: center;
    margin-bottom: 1rem;
  }

  &__confirmation-text {
    margin-bottom: 1.5rem;
    color: #6c757d;
    text-align: center;
  }

  &__alert-icon {
    height: 3rem;
    margin-bottom: 1rem;
  }

  &__form-group {
    margin-bottom: 1rem;
  }

  &__form-label {
    display: inline-block;
    margin-bottom: 0.5rem;
  }
}
</style>
