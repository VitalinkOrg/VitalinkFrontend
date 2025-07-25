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
      ¿Está seguro que desea guardar los cambios?
    </h5>

    <p class="text-muted text-center">
      Una vez guardados los cambios, la valoración se marcará como completada y
      no podrá ser modificada posteriormente.
    </p>

    <div class="alert alert-warning" role="alert">
      <strong>Importante:</strong> Esta acción cambiará el estado de la cita a
      "Valorado" y enviará una notificación al paciente con los resultados de la
      valoración.
    </div>

    <div class="d-flex justify-content-between gap-2">
      <button class="btn btn-outline-dark w-50" @click="$emit('cancelSave')">
        No, volver
      </button>
      <button class="btn btn-primary w-50" @click="$emit('confirmSave')">
        Sí, guardar cambios
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["confirmSave", "cancelSave"]);
</script>

<style lang="scss" scoped>
.fw-bold {
  font-weight: 600;
}

.text-muted {
  color: #6c757d;
}
</style>
