<template>
  <div>
    <h5 class="fw-bold">Detalles de la cita</h5>

    <table class="table table-borderless">
      <tbody>
        <tr>
          <td class="text-muted">Paciente:</td>
          <td>{{ appointment.customer.name }}</td>
        </tr>
        <tr>
          <td class="text-muted">Tipo de servicio:</td>
          <td>Cita de valoración</td>
        </tr>
        <tr>
          <td class="text-muted">Fecha de la cita:</td>
          <td>
            {{ new Date(appointment.appointment_date).toLocaleDateString() }}
          </td>
        </tr>
        <tr>
          <td class="text-muted">Hora de la cita:</td>
          <td>{{ appointment.appointment_hour }}</td>
        </tr>
        <tr>
          <td class="text-muted">Procedimiento:</td>
          <td>{{ appointment.service_name }}</td>
        </tr>
        <tr>
          <td class="text-muted">Motivo:</td>
          <td>{{ appointment.user_description }}</td>
        </tr>
        <tr>
          <td class="text-muted">Procedimiento:</td>
          <td>{{ appointment.notes }}</td>
        </tr>
        <tr>
          <td class="text-muted">Fecha de solicitud:</td>
          <td>
            {{ new Date(appointment.application_date).toLocaleDateString() }}
          </td>
        </tr>
        <tr>
          <td class="text-muted">Tipo de reserva:</td>
          <td class="text-capitalize">
            {{ appointment.appointment_type.name }}
          </td>
        </tr>
        <tr>
          <td class="text-muted">Estado:</td>
          <td>
            <span
              class="badge rounded-5 text-dark"
              :class="statusClass(appointment.appointment_status.code)"
            >
              {{ appointment.appointment_status.value1 }}
            </span>
          </td>
        </tr>

        <!-- Sección para proforma si es valoración -->
        <template
          v-if="
            appointment.appointment_status.code ==
            'VALUED_VALORATION_APPOINTMENT'
          "
        >
          <tr>
            <td class="text-muted">Proforma:</td>
            <td>
              <div>
                <input
                  type="file"
                  ref="proformaFile"
                  style="display: none"
                  @change="$emit('handleProformaUpload', $event)"
                  accept=".pdf,.doc,.docx"
                />
                <button
                  class="btn btn-outline-dark d-flex gap-2"
                  @click="$refs.proformaFile.click()"
                  :disabled="proformaGuardado"
                >
                  <img
                    src="@/src/assets/cloud-upload.svg"
                    width="20"
                    class="mr-2"
                    alt="Vitalink"
                  />
                  Adjuntar Proforma
                </button>
                <div v-if="proformaFileName" class="mt-2 text-primary fw-bold">
                  {{ proformaFileName }}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="text-muted">Valor del procedimiento:</td>
            <td>
              <input type="text" :value="appointment.procedure_value" />
            </td>
          </tr>
          <tr>
            <td class="text-muted">Recomendaciones Post-Cita:</td>
            <td>
              <textarea
                :value="description"
                @input="$emit('update:description', $event.target.value)"
                class="form-control mb-4"
                rows="3"
                placeholder="Escribe las recomendaciones médicas..."
                :disabled="proformaGuardado"
              ></textarea>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  appointment: Object,
  proformaFileName: String,
  proformaGuardado: Boolean,
  description: String,
});

const emit = defineEmits(["handleProformaUpload", "update:description"]);

const statusClass = (status) => {
  switch (status) {
    case "CANCEL_APPOINTMENT":
      return "bg-danger-subtle";
    case "PENDING_VALORATION_APPOINTMENT":
      return "bg-warning-subtle";
    case "PENDING_PROCEDURE":
      return "bg-warning-subtle";
    case "CONFIRM_PROCEDURE":
      return "bg-primary-subtle";
    case "CONCRETED_APPOINTMENT":
      return "bg-primary-subtle";
    case "VALUED_VALORATION_APPOINTMENT":
      return "bg-success-subtle";
    case "CONFIRM_VALIDATION_APPOINTMENT":
      return "bg-success-subtle";
    case "VALUATION_PENDING_VALORATION_APPOINTMENT":
      return "bg-primary-subtle";
    default:
      return "";
  }
};
</script>

<style lang="scss" scoped>
.fw-bold {
  font-weight: 600;
}

.text-muted {
  color: #6c757d;
}

.table {
  margin-bottom: 1.5rem;
}
</style>
