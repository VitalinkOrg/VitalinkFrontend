<template>
  <div>
    <h5 class="fw-bold">¿Seguro que quieres cancelar esta cita?</h5>

    <p class="text-muted">
      Se le enviará un correo electrónico automático al usuario avisándole que
      su cita ha sido cancelada.
    </p>

    <div class="d-flex justify-content-between gap-2">
      <button class="btn btn-outline-dark w-50" @click="$emit('goBack')">
        No, volver
      </button>
      <button class="btn btn-danger w-50" @click="$emit('cancelAppointment')">
        Sí, cancelar
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["goBack", "cancelAppointment"]);
</script>

<style lang="scss" scoped>
.fw-bold {
  font-weight: 600;
}

.text-muted {
  color: #6c757d;
}
</style>
