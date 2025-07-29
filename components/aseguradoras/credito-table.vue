<script setup>
import { computed, inject, ref } from "vue";

const emit = defineEmits(["refreshed"]);
const refreshAppointments = inject("refreshAppointments");

const props = defineProps({
  vouchers: {
    type: Array,
    default: () => [],
  },
});

const expand = ref(false);
const openCreditModal = ref(false);
const modalData = ref(null);
const currentStep = ref(1);
const expandedRow = ref(null); // Track which row is expanded

const statusClass = computed(() => {
  return (status) => {
    return (
      {
        REQUIRED: "bg-warning-subtle",
        APPROVED: "bg-success-subtle",
        CANCELLED: "bg-danger-subtle",
        REJECTED: "bg-danger-subtle",
      }[status] || "bg-secondary-subtle"
    );
  };
});

function isRequested(code) {
  return code !== "REQUIRED";
}

function showCreditDetails(voucher) {
  modalData.value = voucher;
  openCreditModal.value = true;
}

function closeModal() {
  modalData.value = null;
  openCreditModal.value = false;
}

function toggleExpand(voucherId) {
  expandedRow.value = expandedRow.value === voucherId ? null : voucherId;
}
</script>

<template>
  <div class="card shadow rounded-3 border-0 p-3">
    <div
      class="table-responsive card border-0 py-4 rounded-3"
      v-if="vouchers !== null"
    >
      <table class="table fw-light">
        <thead>
          <tr>
            <th scope="col" class="text-muted">Nombre del paciente</th>
            <th scope="col" class="text-muted">Especialidad</th>
            <th scope="col" class="text-muted">Monto Solicitado</th>
            <th scope="col" class="text-muted">Estado de cita</th>
            <th scope="col" class="text-muted"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="voucher in vouchers" :key="voucher.voucher_id">
            <tr>
              <td>{{ voucher.appointment.customer.name }}</td>
              <td>{{ voucher.appointment.package.procedure.name }}</td>
              <td>₡{{ voucher.requested_amount }}</td>
              <td>
                <span
                  class="badge rounded-5 text-dark"
                  :class="statusClass(voucher.credit_status.code)"
                >
                  {{ voucher.credit_status.name }}
                </span>
              </td>
              <td>
                <button
                  @click="showCreditDetails(voucher)"
                  class="btn btn-outline-secondary me-2"
                  :disabled="isRequested(voucher.credit_status.code)"
                >
                  Ver Detalles
                </button>
              </td>
            </tr>
            <tr
              v-if="expandedRow === voucher.voucher_id"
              class="shadow mb-3 rounded-4"
            >
              <td colspan="5" class="px-4">
                <span class="row">
                  <span class="col-3">
                    <dl class="d-flex mb-0">
                      <dt class="fw-normal me-1 text-nowrap">Dirección:</dt>
                      <dd>{{ voucher.address }}</dd>
                    </dl>
                    <dl class="d-flex mb-0">
                      <dt class="fw-normal me-1 text-nowrap">
                        Número de Teléfono:
                      </dt>
                      <dd>{{ voucher.phone_number }}</dd>
                    </dl>
                    <dl class="mb-0">
                      <dt class="fw-normal me-1 text-nowrap">
                        Dirección Física:
                      </dt>
                      <dd>
                        {{
                          voucher.address +
                          ", " +
                          voucher.city +
                          ", " +
                          voucher.postal_code
                        }}
                      </dd>
                    </dl>
                  </span>
                  <span class="col">
                    <dl class="d-flex mb-0">
                      <dt class="fw-normal me-1 text-nowrap">
                        Proveedor del Servicio:
                      </dt>
                      <dd>Hospital CIMA</dd>
                    </dl>
                    <dl class="d-flex mb-0">
                      <dt class="fw-normal me-1 text-nowrap">
                        Costos y Facturación:
                      </dt>
                      <dd>23.000 USD</dd>
                    </dl>
                    <dl class="d-flex mb-0">
                      <dt class="fw-normal me-1 text-nowrap">
                        Número de teléfono:
                      </dt>
                      <dd>+506 7123-4567</dd>
                    </dl>
                    <dl class="mb-0">
                      <dt class="fw-normal me-1 text-nowrap">
                        Dirección Física:
                      </dt>
                      <dd>
                        San José, Autop. Próspero Fernández, San José, San
                        Rafael, Costa Rica, CR-1000
                      </dd>
                    </dl>
                  </span>
                  <span class="col">
                    <span class="form-label">Mensaje del asegurado</span>
                    <span
                      class="d-block p-2 bg-primary rounded-4 fw-light border"
                      style="--bs-bg-opacity: 0.05"
                      >Solicito un voucher para cubrir la operación de cataratas
                      en ambos ojos, recomendada por mi oftalmólogo para mejorar
                      mi visión. Esta intervención es esencial para mi calidad
                      de vida, y agradecería mucho su apoyo en este
                      asunto.</span
                    >
                  </span>
                </span>
                <span class="row">
                  <span class="col">
                    <span
                      class="d-block p-2 bg-primary rounded-4 fw-light border"
                      style="--bs-bg-opacity: 0.05"
                    >
                      <span class="fw-normal mb-1 d-block">
                        <AtomsIconsChatIcon /> Comentarios
                      </span>
                      <span class="bg-light d-block p-2">
                        {{ voucher.comment_by_insurance }}
                      </span>
                      <span class="text-end d-block"
                        ><strong class="fw-medium">Tomás Clark</strong>
                        <span class="text-muted">28 de Septiembre</span></span
                      >
                    </span>
                    <span class="text-end d-block pt-3 pb-2">
                      <button class="btn btn-light border-dark fw-normal me-3">
                        Ver Seguimiento de Reclamaciones
                      </button>
                      <button
                        class="btn btn-info text-white fw-normal me-3"
                        @click="addCommentsModal(voucher)"
                      >
                        Agregar Comentarios o Notas
                      </button>
                      <button class="btn btn-info text-white fw-normal">
                        <AtomsIconsDownloadIcon />
                      </button>
                    </span>
                  </span>
                </span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <AseguradorasAprobarCreditoModal
        :open="openCreditModal"
        :credit="modalData"
        v-model:step="currentStep"
        @close-modal="closeModal"
        @refresh="refreshAppointments"
      />
    </div>
  </div>
</template>
