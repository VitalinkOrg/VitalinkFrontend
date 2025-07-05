<template>
  <div class="form-group mb-4">
    <label class="form-label text-capitalize">Especialidad (máximo 3)</label>

    <!-- Selector de especialidades -->
    <select
      class="form-select"
      v-model="selectedSpecialty"
      :disabled="disabled || selected.length >= 3"
    >
      <option value="" disabled>Seleccione una especialidad</option>
      <option
        v-for="spec in availableSpecialties"
        :key="spec.code"
        :value="spec"
        :disabled="selected.some((s) => s.code === spec.code)"
      >
        {{ spec.name }}
      </option>
    </select>

    <!-- Lista de especialidades seleccionadas -->
    <div class="mt-2" v-if="selected.length > 0">
      <span
        v-for="(spec, idx) in selected"
        :key="idx"
        class="badge bg-primary-subtle text-primary me-1 rounded-5 d-inline-flex align-items-center"
      >
        {{ spec.name }}
        <button
          type="button"
          class="btn-close btn-close-primary ms-1"
          aria-label="Remove"
          @click="removeSpecialty(idx)"
        ></button>
      </span>
    </div>

    <!-- Mensaje al alcanzar el límite -->
    <small class="text-muted" v-if="selected.length >= 3">
      Has alcanzado el máximo de 3 especialidades.
    </small>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Specialty {
  id: number;
  code: string;
  name: string;
}

const props = defineProps<{
  specialties: Specialty[];
  selected: Specialty[];
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: "add", specialty: Specialty): void;
  (e: "remove", index: number): void;
}>();

const selectedSpecialty = ref<Specialty | null>(null);

// Filtra las especialidades que ya están seleccionadas
const availableSpecialties = computed(() => {
  return props.specialties.filter(
    (spec) => !props.selected.some((s) => s.code === spec.code)
  );
});

// Agregar nueva especialidad
const addSpecialty = () => {
  if (selectedSpecialty.value && props.selected.length < 3) {
    emit("add", selectedSpecialty.value);
    selectedSpecialty.value = null;
  }
};

// Eliminar especialidad por índice
const removeSpecialty = (index: number) => {
  emit("remove", index);
};
</script>
