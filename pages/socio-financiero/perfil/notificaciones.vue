<script lang="ts" setup>
useSeoMeta({
  title: "Notificaciones — Vitalink Seguros",
  description:
    "Configura tus preferencias de notificaciones como socio financiero en Vitalink.",
  ogTitle: "Notificaciones — Vitalink Seguros",
  ogDescription:
    "Configura tus preferencias de notificaciones como socio financiero en Vitalink.",
});

definePageMeta({
  middleware: ["auth-insurances"],
});

const { show: showToast } = useToast();
const logger = useLogger("SocioPerfilNotificaciones");

const STORAGE_KEY = "vitalink_socio_notification_preferences";

const receiveNotifications = ref(true);
const notifyConfirmed = ref(true);
const notifyCancelled = ref(true);
const isSubmitting = ref(false);

const loadPreferences = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const prefs = JSON.parse(saved);
    receiveNotifications.value = prefs.receiveNotifications ?? true;
    notifyConfirmed.value = prefs.notifyConfirmed ?? true;
    notifyCancelled.value = prefs.notifyCancelled ?? true;
    logger.debug("Notification preferences loaded");
  } catch (err) {
    logger.error("Error loading notification preferences", { err });
  }
};

const handleSubmit = () => {
  isSubmitting.value = true;
  try {
    const prefs = {
      receiveNotifications: receiveNotifications.value,
      notifyConfirmed: notifyConfirmed.value,
      notifyCancelled: notifyCancelled.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    logger.debug("Notification preferences saved", prefs);
    showToast("Preferencias actualizadas exitosamente", "success");
  } catch (err) {
    logger.error("Error saving notification preferences", { err });
    showToast("Error al actualizar las preferencias", "error");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadPreferences();
});
</script>

<template>
  <NuxtLayout name="socio-dashboard-perfil">
    <h4 class="notif-form__title">
      Notificaciones
    </h4>

    <form
      class="notif-form"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div class="notif-form__section">
        <p class="notif-form__description">
          Recibe notificaciones para estar al corriente de todo lo que surja.
        </p>

        <label class="notif-form__toggle-row">
          <span class="notif-form__toggle-label">
            Quiero recibir notificaciones
          </span>
          <span
            class="notif-form__toggle"
            :class="{ 'notif-form__toggle--on': receiveNotifications }"
            role="switch"
            :aria-checked="receiveNotifications"
            tabindex="0"
            @click="receiveNotifications = !receiveNotifications"
            @keydown.enter.prevent="receiveNotifications = !receiveNotifications"
            @keydown.space.prevent="receiveNotifications = !receiveNotifications"
          >
            <span class="notif-form__toggle-thumb" />
          </span>
        </label>
      </div>

      <div
        class="notif-form__section"
        :class="{ 'notif-form__section--disabled': !receiveNotifications }"
      >
        <p class="notif-form__description">
          Cuando actives las siguientes notificaciones, recibirás un aviso
          directamente en tu perfil.
        </p>

        <div class="notif-form__checkboxes">
          <label class="notif-form__checkbox-row">
            <input
              v-model="notifyConfirmed"
              type="checkbox"
              class="notif-form__checkbox"
              :disabled="!receiveNotifications"
            >
            <span class="notif-form__checkbox-label">
              Recibir notificaciones de citas confirmadas
            </span>
          </label>

          <label class="notif-form__checkbox-row">
            <input
              v-model="notifyCancelled"
              type="checkbox"
              class="notif-form__checkbox"
              :disabled="!receiveNotifications"
            >
            <span class="notif-form__checkbox-label">
              Recibir notificaciones de citas canceladas
            </span>
          </label>
        </div>
      </div>

      <div class="notif-form__actions">
        <button
          type="submit"
          class="notif-form__button notif-form__button--primary"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
        >
          <template v-if="isSubmitting">
            <span
              class="notif-form__spinner"
              aria-hidden="true"
            />
            Actualizando...
          </template>
          <template v-else>
            Actualizar Preferencias
          </template>
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.notif-form {
  margin-top: 1.5rem;

  @include respond-to-max(md) {
    margin-top: 1.25rem;
  }

  @include respond-to-max(sm) {
    margin-top: 1rem;
  }

  &__title {
    font-weight: 400;
    font-size: 1.5rem;
    line-height: 1.75rem;
    margin-bottom: 1rem;
    color: #212529;
    font-family: $font-family-main;

    @include respond-to-max(md) {
      font-size: 1.375rem;
    }

    @include respond-to-max(sm) {
      font-size: 1.25rem;
    }
  }

  &__section {
    margin-bottom: 1.75rem;
    transition: opacity 0.2s ease;

    &--disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  &__description {
    font-size: 0.9375rem;
    color: #6b7280;
    margin-bottom: 1rem;
    line-height: 1.5rem;
  }

  &__toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.875rem 1rem;
    background: #f8faff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  &__toggle-label {
    font-size: 0.9375rem;
    color: #374151;
    font-weight: 500;
    user-select: none;
  }

  &__toggle {
    position: relative;
    width: 2.75rem;
    height: 1.5rem;
    background: #d1d5db;
    border-radius: 9999px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
    outline: none;

    &:focus-visible {
      box-shadow: 0 0 0 3px rgba(53, 65, 180, 0.3);
    }

    &--on {
      background: $color-primary;
    }
  }

  &__toggle-thumb {
    position: absolute;
    top: 0.1875rem;
    left: 0.1875rem;
    width: 1.125rem;
    height: 1.125rem;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;

    .notif-form__toggle--on & {
      transform: translateX(1.25rem);
    }
  }

  &__checkboxes {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__checkbox-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  &__checkbox {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    accent-color: $color-primary;
    cursor: pointer;
  }

  &__checkbox-label {
    font-size: 0.9375rem;
    color: #374151;
    user-select: none;
  }

  &__actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-start;

    @include respond-to-max(md) {
      margin-top: 1.5rem;
    }
  }

  &__button {
    &--primary {
      @include primary-button;

      @include respond-to-max(md) {
        width: 100%;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  &__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: $white;
    border-radius: 50%;
    animation: rotate-spinner 0.6s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
}

@keyframes rotate-spinner {
  to {
    transform: rotate(360deg);
  }
}
</style>
