<template>
  <div>
    <h5 class="fw-bold">Detalles de la valoración</h5>

    <table class="table table-borderless">
      <tbody>
        <tr>
          <td class="text-muted">Paciente:</td>
          <td>{{ appointment.customer.name }}</td>
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
          <td>
            <input
              type="text"
              class="form-control"
              :value="appointment.package?.procedure.name"
              readonly
            />
          </td>
        </tr>
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
                {{
                  proformaFileName ? "Cambiar proforma" : "Adjuntar Proforma"
                }}
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
            <input
              type="text"
              class="form-control"
              :value="appointment.price_procedure"
              readonly
            />
          </td>
        </tr>
        <tr>
          <td class="text-muted">Recomendaciones Post-Cita:</td>
          <td>
            <textarea
              :value="description"
              @input="$emit('update:description', $event.target.value)"
              class="form-control mb-4"
              rows="4"
              placeholder="Escribe las recomendaciones médicas..."
              :disabled="proformaGuardado"
            ></textarea>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      class="d-flex p-2 badge align-items-center bg-info-subtle text-info my-3 rounded-5"
    >
      <img src="@/src/assets/info.svg" class="mr-2" alt="Vitalink" />
      <p class="m-0 text-wrap">
        Complete todos los campos requeridos antes de guardar la valoración
      </p>
    </div>

    <div class="d-flex justify-content-between gap-2">
      <button
        class="btn btn-outline-danger w-50"
        @click="$emit('notSuitableProcedure')"
      >
        No apto para procedimiento
      </button>
      <button
        class="btn btn-primary w-50"
        @click="$emit('saveValoration')"
        :disabled="!canSave"
      >
        Guardar valoración
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  appointment: Object,
  proformaFileName: String,
  proformaGuardado: Boolean,
  description: String,
});

const emit = defineEmits([
  "handleProformaUpload",
  "saveValoration",
  "notSuitableProcedure",
  "update:description",
]);

// Validar que se pueda guardar (proforma y descripción requeridos)
const canSave = computed(() => {
  return (
    props.proformaFileName &&
    props.description &&
    props.description.trim().length > 0
  );
});
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

.form-control:disabled,
.form-control[readonly] {
  background-color: #f8f9fa;
  opacity: 1;
}
</style>
