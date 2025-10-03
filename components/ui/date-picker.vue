<template>
  <VDatePicker
    :model-value="modelValue"
    :min-date="minDate"
    :class="customClass"
    is-required
    trim-weeks
    locale="es"
    :popover="{ visibility: 'click' }"
    @update:model-value="handleDateUpdate"
  >
    <template #default="{ inputEvents }">
      <div class="date-picker__input-wrapper">
        <AtomsIconsCalendarIcon
          size="20"
          class="date-picker__input-icon"
          :class="{
            'date-picker__input-icon--placeholder': !props.modelValue,
          }"
        />
        <input
          :value="props.modelValue ? formatDate(props.modelValue) : ''"
          :placeholder="placeholder"
          class="date-picker__input"
          readonly
          v-on="inputEvents"
          @mousedown.prevent
          @keydown.prevent
        />
        <AtomsIconsChevronDown
          size="20"
          class="date-picker__input-chevron"
          :class="{
            'date-picker__input-chevron--placeholder': !props.modelValue,
          }"
        />
      </div>
    </template>

    <template #header-prev-button>
      <AtomsIconsCaretLeftIcon class="date-picker__calendar-nav" />
    </template>

    <template #header-next-button>
      <AtomsIconsCaretRightIcon class="date-picker__calendar-nav" />
    </template>

    <template #header-title="{ title }">
      <span class="date-picker__calendar-title">
        {{ capitalize(title) }}
      </span>
    </template>

    <template #footer>
      <div v-if="hasConfirmation" class="vc-footer">
        <button
          type="button"
          class="date-picker__confirm-button"
          @click="handleDateConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </VDatePicker>
</template>

<script lang="ts" setup>
import { useFormat } from "~/composables/useFormat";

interface Props {
  modelValue: Date | null;
  minDate?: Date;
  placeholder?: string;
  confirmText?: string;
  customClass?: string;
  hasConfirmation: boolean;
}

interface Emits {
  (e: "update:modelValue", value: Date | null): void;
  (e: "confirm", value: Date | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  minDate: () => new Date(),
  placeholder: "Seleccionar fecha",
  confirmText: "Confirmar",
  customClass: "",
  hasConfirmation: false,
});

const emit = defineEmits<Emits>();

const { formatDate, capitalize } = useFormat();

const displayValue = computed(() => {
  return props.modelValue ? formatDate(props.modelValue) : props.placeholder;
});

const handleDateUpdate = (date: string) => {
  const selectedDate = new Date(date);
  emit("update:modelValue", selectedDate);
};

const handleDateConfirm = () => {
  emit("confirm", props.modelValue);
};
</script>

<style lang="scss" scoped>
.date-picker {
  &__input-wrapper {
    position: relative;
    background: $white;
    box-shadow: 0 0.0625rem 0.125rem 0 rgba(16, 24, 40, 0.05);
    display: flex;
    align-items: center;
    border: none;
    padding: 0;
  }

  &__input {
    @include input-base;
    width: 100%;
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0;
    color: #101828;
    padding: 0.9375rem 1.0625rem 0.9375rem 2.25rem;
  }

  &__input-icon,
  &__input-chevron {
    position: absolute;
    pointer-events: none;

    &--placeholder {
      color: $color-text-secondary;
    }
  }

  &__input-icon {
    left: 0.625rem;
  }

  &__input-chevron {
    right: 1.125rem;
  }

  &__calendar-title {
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.3125rem;
    letter-spacing: 0;
    text-align: center;
    color: #040d14;

    &:hover {
      background-color: $white;
    }
  }

  &__confirm-button {
    @include primary-button;
    padding: 0.625rem 1rem;
  }
}
</style>

<style lang="scss">
.vc-title-wrapper {
  .vc-title {
    @include secondary-button;
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.3125rem;
    letter-spacing: 0;
    text-align: center;
    background-color: $white;
    color: #040d14;
    opacity: 1;
    padding: 0;
    border: none;
    display: block;

    &:hover {
      background: $white;
      color: #040d14;
      opacity: 1;
    }
  }
}

.vc-header {
  .vc-arrow {
    @include secondary-button;
    background: $white;
    color: #52555a;
    padding: 0;

    &:disabled {
      background: $white;
      opacity: 0.5;
    }

    svg {
      width: 0.625rem;
      height: 0.625rem;
    }
  }
}

.vc-popover-content {
  border-radius: 1.25rem;
  padding: 0.5rem;
  overflow: hidden;
  border: none;
  box-shadow:
    0 0.75rem 2.625rem -0.25rem rgba(24, 39, 75, 0.25),
    0 0.5rem 1.125rem -0.375rem rgba(24, 39, 75, 0.2);
}

.vc-popover-caret {
  display: none;
}

.vc-popover-content-wrapper {
  &::before,
  &::after {
    display: none !important;
  }
}

.vc-attr {
  background-color: $white;

  &:hover {
    background-color: #f1f3f7;
  }
}

.vc-highlight-content-solid {
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.3125rem;
  letter-spacing: 0;
  text-align: center;
  background: $color-primary;
  color: $white;

  &:hover {
    background: $color-primary;
  }
}

.vc-disabled {
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.3125rem;
  letter-spacing: 0;
  text-align: center;
  color: #afafaf;

  &:hover {
    background: $white;
  }
}

.vc-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.vc-weekday {
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.3125rem;
  letter-spacing: 0;
  text-align: center;
  color: #040d14;
}
</style>
