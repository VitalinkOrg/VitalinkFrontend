<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

definePageMeta({
  middleware: ["auth-pacientes"],
});

const STORAGE_KEY = "vitalink_notification_preferences";

const notificationStatus = ref<"enabled" | "disabled">("disabled");
const notificationTypes = ref({
  appointmentsCreated: false,
  appointmentsCanceled: false,
  newAvailability: false,
  voucherAccepted: false,
});

const isLoading = ref(false);
const isSaving = ref(false);
const successMessage = ref<string | null>(null);

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const loadNotificationSettings = () => {
  isLoading.value = true;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const preferences = JSON.parse(saved);
      notificationStatus.value = preferences.globalEnabled
        ? "enabled"
        : "disabled";
      notificationTypes.value = {
        appointmentsCreated: preferences.appointmentsCreated ?? false,
        appointmentsCanceled: preferences.appointmentsCanceled ?? false,
        newAvailability: preferences.newAvailability ?? false,
        voucherAccepted: preferences.voucherAccepted ?? false,
      };
    }
  } catch (err) {
    console.error("Error loading notification preferences:", err);
  } finally {
    isLoading.value = false;
  }
};

const saveNotificationSettings = () => {
  isSaving.value = true;
  successMessage.value = null;

  try {
    const preferences = {
      globalEnabled: notificationStatus.value === "enabled",
      appointmentsCreated: notificationTypes.value.appointmentsCreated,
      appointmentsCanceled: notificationTypes.value.appointmentsCanceled,
      newAvailability: notificationTypes.value.newAvailability,
      voucherAccepted: notificationTypes.value.voucherAccepted,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

    successMessage.value = "Guardado";

    setTimeout(() => {
      successMessage.value = null;
    }, 2000);
  } catch (err) {
    console.error("Error saving notification preferences:", err);
  } finally {
    isSaving.value = false;
  }
};

const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveNotificationSettings();
  }, 300);
};

watch(notificationStatus, () => {
  if (!isLoading.value) {
    debouncedSave();
  }
});

watch(
  notificationTypes,
  () => {
    if (!isLoading.value) {
      debouncedSave();
    }
  },
  { deep: true }
);

onMounted(() => {
  loadNotificationSettings();
});
</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <div class="notification-form" aria-labelledby="notification-form-title">
      <h2
        id="notification-form-title"
        class="notification-form__title visually-hidden"
      >
        Configuración de notificaciones
      </h2>

      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="notification-form__loading"
        role="status"
        aria-live="polite"
      >
        <span class="notification-form__spinner" aria-hidden="true"></span>
        Cargando configuración...
      </div>

      <template v-if="!isLoading">
        <fieldset class="notification-form__section">
          <legend class="notification-form__legend">
            Estado de notificaciones
          </legend>
          <p
            id="notification-status-desc"
            class="notification-form__description"
          >
            Recibe notificaciones para estar al corriente de todo lo que surja.
          </p>
          <div
            class="notification-form__radio-group"
            role="radiogroup"
            aria-describedby="notification-status-desc"
          >
            <div class="notification-form__radio-item">
              <input
                v-model="notificationStatus"
                class="notification-form__radio-input"
                type="radio"
                name="notificationStatus"
                id="notificationEnabled"
                value="enabled"
                :disabled="isSaving"
              />
              <label
                class="notification-form__radio-label"
                for="notificationEnabled"
              >
                Activado
              </label>
            </div>
            <div class="notification-form__radio-item">
              <input
                v-model="notificationStatus"
                class="notification-form__radio-input"
                type="radio"
                name="notificationStatus"
                id="notificationDisabled"
                value="disabled"
                :disabled="isSaving"
              />
              <label
                class="notification-form__radio-label"
                for="notificationDisabled"
              >
                Desactivado
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset class="notification-form__section">
          <legend class="notification-form__legend">
            Tipos de notificaciones
          </legend>
          <p
            id="notification-types-desc"
            class="notification-form__description"
          >
            Cuando actives las siguientes notificaciones, recibirás una
            notificación directamente en tu perfil
          </p>
          <div
            class="notification-form__checkbox-group"
            aria-describedby="notification-types-desc"
          >
            <div class="notification-form__checkbox-item">
              <input
                v-model="notificationTypes.appointmentsCreated"
                class="notification-form__checkbox-input"
                type="checkbox"
                id="checkAppointmentsCreated"
                name="appointmentsCreated"
                :disabled="isSaving || notificationStatus === 'disabled'"
              />
              <label
                class="notification-form__checkbox-label"
                for="checkAppointmentsCreated"
              >
                Citas creadas exitosamente
              </label>
            </div>
            <div class="notification-form__checkbox-item">
              <input
                v-model="notificationTypes.appointmentsCanceled"
                class="notification-form__checkbox-input"
                type="checkbox"
                id="checkAppointmentsCanceled"
                name="appointmentsCanceled"
                :disabled="isSaving || notificationStatus === 'disabled'"
              />
              <label
                class="notification-form__checkbox-label"
                for="checkAppointmentsCanceled"
              >
                Citas canceladas
              </label>
            </div>
            <div class="notification-form__checkbox-item">
              <input
                v-model="notificationTypes.newAvailability"
                class="notification-form__checkbox-input"
                type="checkbox"
                id="checkNewAvailability"
                name="newAvailability"
                :disabled="isSaving || notificationStatus === 'disabled'"
              />
              <label
                class="notification-form__checkbox-label"
                for="checkNewAvailability"
              >
                Nuevas disponibilidades de tu centro médico
              </label>
            </div>
            <div class="notification-form__checkbox-item">
              <input
                v-model="notificationTypes.voucherAccepted"
                class="notification-form__checkbox-input"
                type="checkbox"
                id="checkVoucherAccepted"
                name="voucherAccepted"
                :disabled="isSaving || notificationStatus === 'disabled'"
              />
              <label
                class="notification-form__checkbox-label"
                for="checkVoucherAccepted"
              >
                Voucher Request Aceptado
              </label>
            </div>
          </div>
        </fieldset>
      </template>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.visually-hidden {
  @include visually-hidden;
}

.notification-form {
  margin-top: 1rem;
  padding: 0 1rem;

  @include respond-to(md) {
    margin-top: 1.5rem;
    padding: 0;
  }

  &__title {
    margin: 0;
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem;
    justify-content: center;
    color: $color-text-secondary;
    font-family: $font-family-main;
    font-size: 14px;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 24px;
    margin-bottom: 1rem;
  }

  &__status-text {
    font-family: $font-family-main;
    font-size: 13px;
    color: $color-text-secondary;

    &--success {
      color: darken($color-success, 40%);
    }
  }

  &__spinner {
    width: 24px;
    height: 24px;
    border: 3px solid $primary-aqua-light;
    border-top-color: $primary-aqua;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    &--small {
      width: 14px;
      height: 14px;
      border-width: 2px;
    }
  }

  &__section {
    border: none;
    padding: 0;
    margin: 0 0 1.5rem 0;

    @include respond-to(md) {
      margin-bottom: 2rem;
    }
  }

  &__legend {
    @include visually-hidden;
  }

  &__description {
    @include text-base;
    margin-bottom: 1rem;
    line-height: 1.5;

    @include respond-to(md) {
      margin-bottom: 0.75rem;
    }
  }

  &__radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    @include respond-to(sm) {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
  }

  &__radio-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 44px;

    @include respond-to(md) {
      min-height: auto;
      gap: 0.5rem;
    }
  }

  &__radio-input {
    @include custom-radio;

    @include respond-to-max(md) {
      width: 24px;
      height: 24px;

      &:checked::after {
        width: 12px;
        height: 12px;
      }
    }

    &:checked {
      border-color: $primary-aqua;

      &::after {
        background-color: $primary-aqua;
      }
    }

    &:focus-visible {
      outline: 2px solid $primary-aqua;
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__radio-label {
    @include label-base;
    color: $color-text-secondary;
    cursor: pointer;
    font-size: 16px;

    @include respond-to(md) {
      font-size: 14px;
    }
  }

  &__checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include respond-to(md) {
      gap: 0.75rem;
    }
  }

  &__checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-height: 44px;

    @include respond-to(md) {
      align-items: center;
      min-height: auto;
      gap: 0.5rem;
    }
  }

  &__checkbox-input {
    appearance: none;
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 2px solid #c1c7d0;
    margin: 0;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    background-color: $white;
    transition: all 0.2s ease;

    @include respond-to(md) {
      width: 18px;
      height: 18px;
    }

    &:hover:not(:disabled) {
      border-color: $primary-aqua;
    }

    &:focus-visible {
      outline: 2px solid $primary-aqua;
      outline-offset: 2px;
    }

    &:checked {
      background-color: $primary-aqua;
      border-color: $primary-aqua;

      &::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 7px;
        width: 6px;
        height: 12px;
        border: solid $white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);

        @include respond-to(md) {
          top: 2px;
          left: 5px;
          width: 5px;
          height: 9px;
        }
      }
    }

    &:disabled {
      background-color: #f5f5f5;
      border-color: #e0e0e0;
      cursor: not-allowed;

      & + .notification-form__checkbox-label {
        color: #a0a4aa;
        cursor: not-allowed;
      }
    }
  }

  &__checkbox-label {
    @include label-base;
    color: $color-text-secondary;
    cursor: pointer;
    font-size: 16px;
    line-height: 1.4;
    padding-top: 2px;

    @include respond-to(md) {
      font-size: 14px;
      padding-top: 0;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .notification-form {
    &__checkbox-input,
    &__radio-input {
      transition: none;
    }

    &__spinner {
      animation: none;
    }
  }
}

@media (forced-colors: active) {
  .notification-form {
    &__checkbox-input,
    &__radio-input {
      border: 2px solid currentColor;

      &:checked {
        background-color: Highlight;
      }
    }
  }
}
</style>
