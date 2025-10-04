<template>
  <VueDatePicker
    v-model="internalValue"
    :min-date="minDate"
    :class="customClass"
    :locale="locale"
    :format="formatDate"
    :placeholder="placeholder"
    :enable-time-picker="false"
    :auto-apply="!hasConfirmation"
    :clearable="false"
    :action-row="actionRowConfig"
    :select-text="confirmText"
    @update:model-value="handleDateUpdate"
  >
    <template #input-icon>
      <AtomsIconsCalendarIcon
        size="20"
        class="date-picker__input-icon"
        :class="{
          'date-picker__input-icon--placeholder': !props.modelValue,
        }"
      />
    </template>

    <template #arrow-left>
      <AtomsIconsCaretLeftIcon class="date-picker__calendar-nav" />
    </template>

    <template #arrow-right>
      <AtomsIconsCaretRightIcon class="date-picker__calendar-nav" />
    </template>
  </VueDatePicker>
</template>

<script lang="ts" setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useFormat } from "~/composables/useFormat";

interface Props {
  modelValue: Date | null;
  minDate?: Date;
  placeholder?: string;
  confirmText?: string;
  customClass?: string;
  hasConfirmation?: boolean;
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

const { formatDate } = useFormat();

const locale = "es";

const internalValue = ref(props.modelValue);

const actionRowConfig = computed(() => {
  if (!props.hasConfirmation) return { showSelect: false };
  return { showSelect: true };
});

watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue;
  }
);

const handleDateUpdate = (date: Date | null) => {
  internalValue.value = date;
  emit("update:modelValue", date);

  if (!props.hasConfirmation && date) {
    emit("confirm", date);
  }
};
</script>

<style lang="scss" scoped>
.date-picker {
  &__input-icon {
    color: inherit;

    &--placeholder {
      color: $color-text-secondary;
    }
  }

  &__calendar-nav {
    width: 1rem;
    height: 1rem;
  }
}
</style>

<style lang="scss">
.dp__theme_light {
  --dp-background-color: #{$white};
  --dp-text-color: #101828;
  --dp-hover-color: #f1f3f7;
  --dp-hover-text-color: #101828;
  --dp-primary-color: #{$color-primary};
  --dp-primary-text-color: #{$white};
  --dp-secondary-color: #52555a;
  --dp-border-color: transparent;
  --dp-menu-border-color: transparent;
  --dp-border-color-hover: transparent;
  --dp-disabled-color: #afafaf;
  --dp-disabled-color-text: #afafaf;
  --dp-scroll-bar-background: #f3f3f3;
  --dp-scroll-bar-color: #959595;
  --dp-font-family: #{$font-family-main};
  --dp-border-radius: 1.25rem;
  --dp-cell-border-radius: 50%;
}

.dp__input_wrap {
  position: relative;
  border: none;
}

.dp__input {
  @include input-base;
  width: 100% !important;
  padding: 15px 3rem 15px 2.25rem !important;
  font-family: $font-family-main !important;
  font-size: 14.7px !important;
  color: #425466 !important;
  background: $white !important;
  border: 1px solid #d4dae0 !important;
  border-radius: $border-radius-md !important;
  box-shadow:
    0 0 1.05px rgba(50, 50, 71, 0.2),
    0 1.05px 2.1px rgba(50, 50, 71, 0.08) !important;
  line-height: 1.5rem;
  letter-spacing: 0;
  transition: all 0.3s ease !important;

  &:hover {
    border: 1px solid $color-primary !important;
  }

  &::placeholder {
    color: #7a828a !important;
    opacity: 1 !important;
  }

  &:focus,
  &:focus-visible {
    outline: none !important;
    border-color: $color-primary !important;
    box-shadow:
      0 0 0 4px rgba($color-primary, 0.2),
      0 0 1.05px rgba(53, 65, 180, 0.4),
      0 1.05px 2.1px rgba(50, 50, 71, 0.1) !important;
  }

  &:disabled {
    background-color: #f9f9f9 !important;
    color: #a0a4aa !important;
    cursor: not-allowed !important;
    border-color: #e0e0e0 !important;
  }
}

.dp__input_icon {
  left: 0.625rem;
}

.dp__clear_icon {
  display: none;
}

.dp__input_icon_pad {
  padding-left: 2.25rem;
}

.dp__menu {
  border-radius: 1.25rem;
  padding: 0.5rem;
  border: none;
  box-shadow:
    0 0.75rem 2.625rem -0.25rem rgba(24, 39, 75, 0.25),
    0 0.5rem 1.125rem -0.375rem rgba(24, 39, 75, 0.2);
}

.dp__calendar_header_item {
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.3125rem;
  letter-spacing: 0;
  text-align: center;
  color: #040d14;
}

.dp__month_year_select {
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.3125rem;
  letter-spacing: 0;
  text-align: center;
  color: #040d14;

  &:hover {
    background-color: $white;
    color: #040d14;
  }
}

.dp__calendar_item {
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.3125rem;
  letter-spacing: 0;
  text-align: center;
}

.dp__cell_inner {
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.3125rem;
}

.dp__active_date,
.dp__range_start,
.dp__range_end {
  background: $color-primary !important;
  color: $white !important;
}

.dp__today {
  border: none;
  background: transparent;
  color: inherit;
}

.dp__today.dp__active_date {
  background: $color-primary !important;
  color: $white !important;
  border: none;
}

.dp__cell_disabled {
  color: #afafaf;
}

.dp__arrow_top {
  display: none;
}

.dp__instance_calendar {
  font-family: $font-family-alt;
}

.dp__action_buttons {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  gap: 0.5rem;
}

.dp__action_button {
  &.dp__action_select {
    @include primary-button;
    padding: 0.625rem 1rem;
    background: $color-primary;
    color: $white;
    border: none;
    border-radius: 0.5rem;
    font-family: $font-family-main;
    font-size: 1rem;
    cursor: pointer;
    min-width: auto;

    &:hover {
      background: $color-primary;
      opacity: 0.9;
    }
  }

  &.dp__action_cancel {
    display: none;
  }
}

.dp__action_row {
  padding: 0;
}
</style>
