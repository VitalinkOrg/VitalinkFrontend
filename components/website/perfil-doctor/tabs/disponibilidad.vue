<template>
  <div class="availability-tab">
    <div class="availability-tab__header">
      <h3 class="availability-tab__title">Agenda de disponibilidad</h3>
    </div>
    <div class="availability-tab-card">
      <div class="availability-tab-card__content">
        <!-- Date Selection -->
        <div class="availability-tab-card__date-selection">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="availability-tab-card__title">Seleccione una fecha</h4>
            <div
              class="calendar-container badge rounded-5 bg-primary text-primary p-2"
              style="--bs-bg-opacity: 0.07"
            >
              <div class="custom-select-wrapper">
                <select
                  :model-value="selectedMonth"
                  @change="handleMonthChange($event)"
                  class="form-select badge bg-transparent border-0 shadow-none text-primary text-left text-start"
                  style="--bs-bg-opacity: 0.07"
                >
                  <option :value="null" disabled>Seleccione un mes</option>
                  <option
                    v-for="month in months"
                    :key="month.value"
                    :value="month.value"
                  >
                    {{ month.label }}
                  </option>
                </select>
              </div>

              <img
                src="@/src/assets/calendar.svg"
                alt="Busca centro medico"
                class="img-fluid text-primary"
              />
            </div>
          </div>

          <div class="d-flex gap-2 overflow-auto pb-2">
            <button
              v-for="day in availableDays"
              :key="day.date"
              @click="selectDay(day.date)"
              class="btn btn-outline-info d-flex flex-column align-items-center"
              :class="{ active: selectedDay === day.date }"
              style="min-width: 60px; padding: 8px 12px; border-radius: 8px"
            >
              <span
                class="small text-info"
                :class="{ 'text-white': selectedDay === day.date }"
              >
                {{ day.day }}
              </span>
              <span
                class="fw-semibold text-info"
                :class="{ 'text-white': selectedDay === day.date }"
                >{{ day.number }}
              </span>
            </button>
          </div>
        </div>

        <!-- Time Selection -->
        <div v-if="selectedDay" class="mt-4">
          <h4 class="h6 fw-semibold mb-3">Seleccione la hora</h4>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="(time, index) in availableHours"
              :key="index"
              @click="selectHour(time)"
              class="btn btn-outline-info position-relative hover-info"
              :class="{
                'active border-info text-white hover-info':
                  selectedHour === time,
              }"
              style="border-radius: 8px; padding: 8px 16px"
            >
              {{ formatTime(time) }}
            </button>
          </div>
        </div>

        <div v-else class="text-muted mt-4">
          Por favor seleccione una fecha para ver los horarios disponibles
        </div>
      </div>
    </div>
    <!-- Reservation Button -->
    <div class="availability-tab__reservation-button-wrapper">
      <button
        class="availability-tab__reserve-button"
        :disabled="!selectedHour"
        @click="reserveAppointment()"
      >
        Reservar Cita de valoración
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedDay: string | null;
  availableHours: string[];
  selectedHour: string | null;
  availableDays: Array<{ date: string; day: string; number: number }>;
  selectedMonth: number | null;
  months: Array<{ value: number; label: string }>;
  formatTime: (time: string) => string;
  reserveAppointment: () => void;
  availability: Record<string, string[]>;
}>();

const emit = defineEmits<{
  (e: "update:selectedDay", value: string | null): void;
  (e: "update:selectedMonth", value: number | null): void;
  (e: "update:selectedHour", value: string | null): void;
  (
    e: "update:availableDays",
    value: Array<{ date: string; day: string; number: number }>
  ): void;
}>();

const weekdayMap = {
  Monday: "Lun",
  Tuesday: "Mar",
  Wednesday: "Mié",
  Thursday: "Jue",
  Friday: "Vie",
  Saturday: "Sáb",
  Sunday: "Dom",
} as const;

const handleMonthChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value;
  const monthValue = value ? parseInt(value) : null;

  emit("update:selectedMonth", monthValue);

  emit("update:selectedDay", null);
  emit("update:selectedHour", null);
};

const selectDay = (date: string) => {
  emit("update:selectedDay", date);
  emit("update:selectedHour", null);
};

const selectHour = (time: string) => {
  emit("update:selectedHour", time);
};

type Weekday = keyof typeof weekdayMap;

function getAvailableDaysForMonth(month: number | null) {
  if (month === null) return [];

  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableDays = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

    if (props.availability[dateStr] && props.availability[dateStr].length > 0) {
      const weekday = date.toLocaleDateString("en-US", {
        weekday: "long",
      }) as Weekday;

      availableDays.push({
        date: dateStr,
        day: weekdayMap[weekday],
        number: date.getDate(),
      });
    }
  }

  return availableDays;
}

watch(
  () => props.selectedMonth,
  (newMonth) => {
    const availableDays = getAvailableDaysForMonth(newMonth);
    emit("update:availableDays", availableDays);
  }
);
</script>

<style lang="scss" scoped>
.availability-tab {
  padding: 20px 0px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 15px;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    color: #19213d;
  }

  .availability-tab-card {
    gap: 17px;
    border-radius: 15px;
    padding: 15px;
    background-color: #f8faff;
    box-shadow: 0px 1px 4px 0px #19213d14;
    margin-top: 22px;

    &__title {
      @include label-base;
      font-weight: 400;
      font-size: 16px;
      line-height: 20px;
      color: #19213d;
    }

    &__date-selection {
      margin: 0;
    }
  }

  &__reservation-button-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  &__reserve-button {
    @include primary-button;
    margin-top: 20px;
  }
}
</style>
