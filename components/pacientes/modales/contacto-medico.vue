<template>
  <button
    class="appointment-contact-modal__trigger"
    @click="openModal"
    aria-label="Abrir información de contacto del médico"
    type="button"
  >
    <AtomsIconsPhoneIcon size="20" aria-hidden="true" />
  </button>

  <AtomsModalBase
    :is-open="isOpen"
    size="extra-small"
    @close="closeModal"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <template #title>
      <span
        class="appointment-contact-modal__header--icon"
        role="img"
        aria-label="Icono de teléfono"
      >
        <AtomsIconsPhoneIcon aria-hidden="true" />
      </span>
    </template>

    <div class="appointment-contact-modal__content">
      <h5 :id="titleId" class="appointment-contact-modal__title">
        Contacta con el médico ahora:
      </h5>

      <div class="appointment-contact-modal__body" role="list">
        <div class="appointment-contact-modal__body--label" role="listitem">
          <div class="appointment-contact-modal__body--icon">
            <AtomsIconsGlobeIcon aria-hidden="true" />
            <span id="tipo-label">Tipo</span>
          </div>
          <div class="appointment-contact-modal__body--value">
            <img
              src="@/src/assets/cr.svg"
              height="20"
              width="20"
              alt="Bandera de Costa Rica"
              role="img"
            />
            <span aria-labelledby="tipo-label"> Número de Costa Rica </span>
          </div>
        </div>

        <div class="appointment-contact-modal__body--label" role="listitem">
          <div class="appointment-contact-modal__body--icon">
            <AtomsIconsPhoneOutgoingIcon aria-hidden="true" />
            <span id="telefono-label">N° de teléfono</span>
          </div>
          <div class="appointment-contact-modal__body--value">
            <a
              :href="`tel:${phoneNumber}`"
              :aria-label="`Llamar al ${formatPhone(phoneNumber, { addPrefix: true })}`"
              class="appointment-contact-modal__phone-link"
            >
              {{
                formatPhone(phoneNumber, {
                  addPrefix: true,
                })
              }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { Appointment } from "@/types";

const { formatPhone } = useFormat();

const isOpen = ref<boolean>(false);
const titleId = ref<string>(
  `modal-title-${Math.random().toString(36).substr(2, 9)}`,
);

const phoneNumber = computed(() => props.appointment.supplier.phone_number);

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const openModal = () => {
  isOpen.value = true;
  // Gestión de foco: mover el foco al modal cuando se abre
  nextTick(() => {
    const modalElement = document.querySelector('[role="dialog"]');
    if (modalElement instanceof HTMLElement) {
      modalElement.focus();
    }
  });
};

const closeModal = () => {
  isOpen.value = false;
  nextTick(() => {
    const triggerButton = document.querySelector(
      ".appointment-contact-modal__trigger",
    );
    if (triggerButton instanceof HTMLElement) {
      triggerButton.focus();
    }
  });
};

onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen.value) {
      closeModal();
    }
  };
  window.addEventListener("keydown", handleEscape);

  onUnmounted(() => {
    window.removeEventListener("keydown", handleEscape);
  });
});
</script>

<style lang="scss" scoped>
.appointment-contact-modal {
  &__trigger {
    @include button-base;
    border-radius: 0.5rem;
    padding: 0;
    color: $color-text-muted;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    &:hover {
      background-color: #f9fafb;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__content {
    position: relative;
    background: $white;
    border-radius: 1rem;
    padding: 1.5rem;
    width: auto;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.5rem;

    &--icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 2.4375rem;
      height: 2.4375rem;
      background-color: $color-primary;
      border-radius: 100%;
      border: 0.40625rem solid #ebecf7;
      color: $white;
      box-sizing: content-box;
      transform: translateX(-0.1875rem) translateY(-0.1875rem);

      svg {
        width: 1.25rem;
        height: 1.25rem;
      }
    }
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.875rem;
    color: $color-foreground;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin-top: 1.5rem;

    &--label {
      display: flex;
      justify-content: space-between;
    }

    &--value {
      display: flex;
      gap: 0.625rem;
      align-items: center;

      svg {
        width: 1.5rem;
        height: 1.5rem;
      }

      label,
      span {
        @include label-base;
        font-weight: 500;
        font-size: 0.875rem;
        line-height: 1.5rem;
        color: $color-foreground;
      }
    }

    &--icon {
      display: flex;
      gap: 0.625rem;
      align-items: center;

      svg {
        width: 1.5rem;
        height: 1.5rem;
        color: $color-text-secondary;
      }

      label,
      span {
        @include label-base;
        font-weight: 500;
        font-size: 0.875rem;
        line-height: 1.5rem;
        color: $color-text-secondary;
      }
    }
  }

  &__phone-link {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 0.25rem;
    }
  }
}
</style>
