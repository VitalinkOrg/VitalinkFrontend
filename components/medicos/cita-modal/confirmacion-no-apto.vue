<template>
  <div>
    <div class="text-center mb-4">
      <img
        src="@/src/assets/warning.svg"
        width="48"
        class="mb-3"
        alt="Advertencia"
      />
    </div>

    <h5 class="fw-bold text-center">
      ¿Confirmar que el paciente no es apto para el procedimiento?
    </h5>

    <p class="text-muted text-center">
      Esta acción marcará la valoración como completada indicando que el
      paciente no es candidato para el procedimiento solicitado.
    </p>

    <div class="alert alert-danger" role="alert">
      <strong>Importante:</strong> Esta acción cambiará el estado de la cita a
      "Valorado" y enviará una notificación automática al paciente informando
      que no es apto para el procedimiento. Esta decisión no podrá ser
      revertida.
    </div>

    <div class="d-flex justify-content-between gap-2">
      <button class="btn btn-outline-dark w-50" @click="$emit('cancel')">
        No, volver
      </button>
      <button class="btn btn-danger w-50" @click="$emit('confirmNotSuitable')">
        Sí, confirmar
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["confirmNotSuitable", "cancel"]);
</script>

<style lang="scss" scoped>
.fw-bold {
  font-weight: 600;
}

.text-muted {
  color: #6c757d;
}
</style>
