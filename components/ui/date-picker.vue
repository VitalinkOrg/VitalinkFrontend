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
        <AtomsIconsCalendarIcon size="20" class="date-picker__input-icon" />
        <input
          :value="displayValue"
          :placeholder="placeholder"
          class="date-picker__input"
          readonly
          v-on="inputEvents"
        />
        <AtomsIconsChevronDown size="20" class="date-picker__input-chevron" />
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
      <div class="vc-footer">
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
    box-shadow: 0px 1px 2px 0px #1018280d;
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
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0;
    color: #101828;
    padding: 15px 17px 15px 36px;
  }

  &__input-icon,
  &__input-chevron {
    position: absolute;
  }

  &__input-icon {
    left: 10px;
  }

  &__input-chevron {
    right: 18px;
  }

  &__calendar-title {
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    letter-spacing: 0;
    text-align: center;
    color: #040d14;

    &:hover {
      background-color: $white;
    }
  }

  &__confirm-button {
    @include primary-button;
    padding: 10px 16px;
  }
}
</style>

<style lang="scss">
.vc-title-wrapper {
  .vc-title {
    @include secondary-button;
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
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
      width: 10px;
      height: 10px;
    }
  }
}

.vc-popover-content {
  border-radius: 20px;
  padding: 8px;
  overflow: hidden;
  border: none;
  box-shadow:
    0 12px 42px -4px rgba(24, 39, 75, 0.25),
    0 8px 18px -6px rgba(24, 39, 75, 0.2);
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
  font-family: Inter;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0;
  text-align: center;
  background: #3541b4;
  color: $white;

  &:hover {
    background: #3541b4;
  }
}

.vc-disabled {
  font-family: Inter;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
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
  padding: 16px;
}

.vc-weekday {
  font-family: Inter;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0;
  text-align: center;
  color: #040d14;
}
</style>
