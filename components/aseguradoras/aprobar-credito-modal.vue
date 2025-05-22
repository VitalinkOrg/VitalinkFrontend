<template>
  <div
    class="modal fade"
    id="credit.id"
    :class="open ? 'show' : ''"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    v-if="credit"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header border-0 align-items-center d-flex">
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="closeModal"
          ></button>
        </div>
        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Step 1: Appointment Details -->
          <div v-if="localStep === 1">
            <h5 class="fw-bold">Detalles de la solicitud</h5>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td class="text-muted">Información del Paciente:</td>
                  <td>{{ credit.appointment.customer.name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Especialidad:</td>
                  <td>
                    {{
                      credit.appointment.package.specialty.medical_specialty
                        .name
                    }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ credit.appointment.package.procedure.name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de Solicitud:</td>
                  <td>{{ formatDate(credit.created_date) }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Monto Solicitado:</td>
                  <td>${{ credit.requested_amount }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Monto a Aprobar:</td>
                  <td>
                    <input
                      type="number"
                      v-model="approvedAmount"
                      :max="credit.requested_amount"
                      class="form-control"
                      :class="{ 'is-invalid': amountError }"
                    />
                    <div v-if="amountError" class="invalid-feedback">
                      {{ amountError }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Observaciones del Análisis:</td>
                  <td>
                    <textarea
                      v-model="description"
                      class="form-control mb-4"
                      rows="3"
                      placeholder="Campo para detallar motivos del ajuste si se aprueba con un monto menor"
                      :disabled="proformaGuardado"
                    ></textarea>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="row mt-4">
              <div class="col-12 d-flex justify-content-end">
                <button
                  class="btn btn-outline-danger me-2"
                  @click="localStep = 4"
                >
                  Anular Solicitud
                </button>
                <button
                  class="btn btn-primary"
                  @click="validateAndProceed"
                  :disabled="isApproveDisabled"
                >
                  Aprobar Solicitud
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Payment Details -->
          <div v-if="localStep === 2">
            <span
              style="max-width: max-content"
              class="d-flex justify-content-between gap-2 rounded-circle bg-warning-subtle text-warning p-3 my-3"
            >
              <img
                src="@/src/assets/warning.svg"
                width="20"
                class="mr-2"
                alt="Vitalink"
              />
            </span>
            <h5 class="fw-bold">Confirmación de aprobación</h5>
            <p class="text-muted">
              Para continuar por favor adjunta el documento de aprobación con
              las condiciones de pago para el paciente:
            </p>

            <div class="file-upload-container mb-3">
              <input
                type="file"
                id="documentUpload"
                ref="fileInput"
                @change="handleFileUpload"
                accept=".pdf,.doc,.docx"
                class="d-none"
              />
              <label
                for="documentUpload"
                class="d-flex flex-wrap align-items-center justify-content-between gap-2 bg-info-subtle p-3 cursor-pointer"
                :class="{ 'border border-success': uploadedFile }"
              >
                <div class="d-flex align-items-center gap-2">
                  <img
                    src="@/src/assets/cloud-upload.svg"
                    width="20"
                    class="mr-2"
                    alt="Upload"
                  />
                  <span v-if="!uploadedFile">
                    Arrastra un archivo o haz click para buscar en tu ordenador
                  </span>
                  <span v-else class="text-success">
                    Documento cargado: {{ uploadedFile.name }}
                  </span>
                </div>
                <button
                  v-if="uploadedFile"
                  @click.stop="removeFile"
                  class="btn btn-sm btn-outline-danger"
                >
                  Eliminar
                </button>
              </label>
              <div v-if="fileError" class="text-danger small mt-2">
                {{ fileError }}
              </div>
            </div>

            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="localStep = 1">
                Cancelar
              </button>
              <button
                class="btn btn-primary w-50"
                @click="confirmAppointment"
                :disabled="!uploadedFile"
              >
                Confirmar Aprobación
              </button>
            </div>
          </div>

          <!-- Step 3: Confirmation -->
          <div v-if="localStep === 3">
            <span class="d-flex justify-content-center">
              <img
                src="@/src/assets/check.svg"
                width="48"
                class="mb-3"
                alt="Vitalink"
              />
            </span>
            <h4 class="confirmation-title text-primary text-center">
              ¡Solicitud Aprobada!
            </h4>
            <p class="mb-4 text-muted text-center">
              La solicitud de crédito ha sido aprobada exitosamente
            </p>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td class="text-muted">Paciente:</td>
                  <td>{{ credit.patient_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Monto Aprobado:</td>
                  <td>${{ approvedAmount }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Documento:</td>
                  <td>{{ uploadedFile.name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de aprobación:</td>
                  <td>{{ new Date().toLocaleDateString() }}</td>
                </tr>
              </tbody>
            </table>
            <div class="d-flex justify-content-center mt-4">
              <button class="btn btn-primary" @click="closeModal">
                Finalizar
              </button>
            </div>
          </div>

          <!-- Step 4: Cancellation Confirmation -->
          <div v-if="localStep === 4">
            <img
              src="@/src/assets/trash.svg"
              alt="Alerta"
              style="height: 3rem"
              class="mb-3"
            />
            <h5 class="fw-bold">
              ¿Seguro que quieres rechazar esta solicitud?
            </h5>
            <p class="text-muted">
              ¿Está seguro de rechazar esta solicitud? Al rechazar, el paciente
              recibirá un voucher de descuento de Vitalink.
            </p>
            <div class="mb-3">
              <label for="rejectionReason" class="form-label"
                >Motivo del rechazo:</label
              >
              <textarea
                id="rejectionReason"
                v-model="rejectionReason"
                class="form-control"
                rows="3"
                placeholder="Explique el motivo del rechazo..."
              ></textarea>
            </div>
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="localStep = 1">
                Volver
              </button>
              <button
                class="btn btn-danger w-50"
                @click="cancelAppointment"
                :disabled="!rejectionReason"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");

const props = defineProps({
  credit: Object,
  open: Boolean,
  step: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits([
  "update:step",
  "close-modal",
  "approve-credit",
  "reject-credit",
]);

// Form data
const approvedAmount = ref(null);
const description = ref("");
const uploadedFile = ref(null);
const rejectionReason = ref("");
const fileError = ref("");
const amountError = ref(false);

// UI state
const localStep = ref(props.step);
const proformaGuardado = ref(false);

// Watch for prop changes
watch(
  () => props.step,
  (newVal) => {
    localStep.value = newVal;
  }
);

watch(
  () => props.credit,
  (newCredit) => {
    if (newCredit) {
      approvedAmount.value = newCredit.requested_amount;
    }
  }
);

// Validate approved amount
watch(
  () => approvedAmount.value,
  (newVal) => {
    if (!newVal) {
      amountError.value = "El monto es requerido";
      return;
    }

    if (
      props.credit?.requested_amount &&
      newVal > props.credit.requested_amount
    ) {
      amountError.value = `El monto no puede exceder $${props.credit.requested_amount}`;
    } else if (newVal <= 0) {
      amountError.value = "El monto debe ser mayor a 0";
    } else {
      amountError.value = "";
    }
  }
);

const isApproveDisabled = computed(() => {
  return (
    !approvedAmount.value ||
    approvedAmount.value <= 0 ||
    approvedAmount.value > props.credit.requested_amount
  );
});

const validateAndProceed = () => {
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

  if (approvedAmount.value <= 0) {
    amountError.value = "El monto debe ser mayor a 0";
    return;
  }

  localStep.value = 2;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      fileError.value = "Solo se aceptan archivos PDF o Word";
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      fileError.value = "El archivo no puede exceder 5MB";
      return;
    }

    uploadedFile.value = file;
    fileError.value = "";
  }
};

const removeFile = () => {
  uploadedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const confirmAppointment = async () => {
  if (!uploadedFile.value) {
    fileError.value = "Debe subir un documento para continuar";
    return;
  }

  try {
    // Step 1: Upload the document first to get the document code
    const formData = new FormData();
    formData.append("file", uploadedFile.value);

    // Prepare the document metadata fields
    const documentFields = {
      title: `Credit_Document_${props.credit.id}`,
      type: "DOC",
      description: description.value || "",
      id_for_table: props.credit.id,
      table: "APPOINTMENT_CREDIT",
      action_type: "PRIVATE_CONTRACT",
      user_id: user_info.value.id, // Assuming you have the current user available
      is_public: 0,
    };

    formData.append("fields", JSON.stringify(documentFields));

    // Make the document upload request
    const documentResponse = await fetch(
      `${config.public.API_BASE_URL}/document/add`,
      {
        method: "POST",
        headers: { Authorization: token.value },
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

    console.log(props.credit);

    // Step 2: Approve the credit with the document code
    const { data, error } = await useFetch(
      `${config.public.API_BASE_URL}/appointmentcredit/edit?id=${props.credit.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: token.value,
          "Content-Type": "application/json",
        },
        body: {
          credit_status_code:
            approvedAmount.value < parseFloat(props.credit.requested_amount)
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
      throw new Error(error.value.data?.info || "Error al aprobar el crédito");
    }

    // Success - move to confirmation step
    localStep.value = 3;

    // Emit event to parent
    emit("approve-credit", {
      creditId: props.credit.id,
      approvedAmount: approvedAmount.value,
      document: uploadedFile.value.name,
      comments: description.value,
      documentCode: documentCode,
    });
  } catch (error) {
    console.error("Error approving credit:", error);
    fileError.value = error.message || "Error al procesar la aprobación";
  }
};

const cancelAppointment = async () => {
  if (!rejectionReason.value) return;

  const { data, error } = await useFetch(
    config.public.API_BASE_URL +
      "/appointmentcredit/edit?id=" +
      props.credit.id,
    {
      method: "PUT",
      headers: { Authorization: token.value },
      body: {
        credit_status_code: "REJECTED",
      },
    }
  );
  if (data.value) {
    // Emit event to parent
    emit("reject-credit", {
      creditId: props.credit.id,
      reason: rejectionReason.value,
    });
  }
  if (error.value) {
    console.log(error.value, "data");
    errorText.value = error.value.data.info;
  }

  closeModal();
};

const closeModal = () => {
  // Reset form
  approvedAmount.value = props.credit?.requested_amount || 0;
  description.value = "";
  uploadedFile.value = null;
  rejectionReason.value = "";
  fileError.value = "";
  amountError.value = "";

  // Reset steps
  localStep.value = 1;
  emit("close-modal");
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<style lang="scss" scoped>
.show {
  display: block;
}

.modal-header {
  padding: 1rem 1rem 0 1rem;
}

.modal-body {
  padding: 1rem;
}

.cursor-pointer {
  cursor: pointer;
}

.file-upload-container {
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #0d6efd;
    background-color: rgba(13, 110, 253, 0.05);
  }
}

.confirmation-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
}
</style>
