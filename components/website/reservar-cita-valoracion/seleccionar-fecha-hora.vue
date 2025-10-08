<template>
  <section class="select-date-time__step-content">
    <header class="select-date-time__step-description">
      <h2 class="select-date-time__step-text">
        Selecciona las fechas de preferencia
      </h2>
      <p class="select-date-time__step-subtext">
        Los días y horas que tengas disponibles para que lo tengamos de
        referencia para poder concretar una cita con tu médico.
      </p>
    </header>

    <UiAvailabilitySelector
      v-if="supplierId"
      v-model="selectedDateTime"
      :supplier-id="supplierId"
    />
  </section>
</template>

<script lang="ts" setup>
interface Props {
  selectedDay: string | null;
  selectedHour: string | null;
  supplierId: number;
}

interface Emit {
  (event: "set-selected-day", date: string): void;
  (event: "set-selected-hour", time: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();

const selectedDateTime = ref<{ day: string | null; hour: string | null }>({
  day: props.selectedDay,
  hour: props.selectedHour,
});

watch(
  () => selectedDateTime.value.day,
  (newDay) => {
    if (newDay) {
      emit("set-selected-day", newDay);
    }
  }
);

watch(
  () => selectedDateTime.value.hour,
  (newHour) => {
    if (newHour) {
      emit("set-selected-hour", newHour);
    }
  }
);

// Watch para sincronizar props con el estado local
watch(
  () => props.selectedDay,
  (newDay) => {
    if (newDay !== selectedDateTime.value.day) {
      selectedDateTime.value.day = newDay;
    }
  }
);

watch(
  () => props.selectedHour,
  (newHour) => {
    if (newHour !== selectedDateTime.value.hour) {
      selectedDateTime.value.hour = newHour;
    }
  }
);
</script>

<style lang="scss" scoped>
.select-date-time {
  &__step-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__step-description {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__step-text {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: #19213d;
    margin: 0;
  }

  &__step-subtext {
    @include label-base;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #6d758f;
    margin: 0;
  }
}
</style>
