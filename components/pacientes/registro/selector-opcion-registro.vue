<template>
  <div class="registration-options">
    <!-- Opción 1: Cédula -->
    <label
      class="registration-option"
      :class="{ 'is-selected': selectedOption === 'idCard' }"
    >
      <input
        type="radio"
        name="registrationOption"
        value="idCard"
        v-model="selectedOption"
      />
      <span class="registration-option-label">Registrarme con cédula</span>
    </label>

    <!-- Opción 2: Email -->
    <label
      class="registration-option"
      :class="{ 'is-selected': selectedOption === 'email' }"
    >
      <input
        type="radio"
        name="registrationOption"
        value="email"
        v-model="selectedOption"
      />
      <span class="registration-option-label">Correo electrónico</span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { useState } from "#app";
import { ref, watchEffect } from "vue";

const lastSelectedOption = useState<"email" | "idCard">("registrationOption", () => "idCard");
const selectedOption = ref<"email" | "idCard">(lastSelectedOption.value);

watchEffect(() => {
  lastSelectedOption.value = selectedOption.value;
});

defineExpose({ selectedOption });
</script>

<style lang="scss" scoped>

.registration-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.registration-option {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
  border: 1px solid #e1e4ed;
  cursor: pointer;
  transition: border-color 0.3s ease;
  position: relative;

  &.is-selected {
    border-color: $color-primary;
  }

  input[type="radio"] {
    @include custom-radio;
  }

  .registration-option-label {
    font-size: 16px;
    color: #27272e;
    cursor: pointer;
  }
}
</style>
