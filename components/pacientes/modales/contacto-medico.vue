<template>
  <button class="appointment-contact-modal__trigger" @click="openModal">
    <AtomsIconsPhoneIcon size="20" />
  </button>

  <AtomsModalBase :is-open="isOpen" size="extra-small" @close="closeModal">
    <template #title>
      <span class="appointment-contact-modal__header--icon">
        <AtomsIconsPhoneIcon />
      </span>
    </template>

    <div class="appointment-contact-modal__content">
      <h5 class="appointment-contact-modal__title">
        Contacta con el paciente ahora:
      </h5>

      <div class="appointment-contact-modal__body">
        <div class="appointment-contact-modal__body--label">
          <div class="appointment-contact-modal__body--icon">
            <AtomsIconsGlobeIcon />
            <label for="tipo"> Tipo </label>
          </div>
          <div class="appointment-contact-modal__body--value">
            <img
              src="@/src/assets/cr.svg"
              height="20px"
              width="20px"
              alt="Alerta"
            />
            <label class="form-check-label" for="numeroCostaRica">
              Número de Costa Rica
            </label>
          </div>
        </div>
        <div class="appointment-contact-modal__body--label">
          <div class="appointment-contact-modal__body--icon">
            <AtomsIconsPhoneOutgoingIcon />
            <label for="tipo">N° de teléfono</label>
          </div>
          <div class="appointment-contact-modal__body--value">
            <label class="form-check-label" for="numeroCostaRica">
              {{
                formatPhone(phoneNumber, {
                  addPrefix: true,
                })
              }}
            </label>
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

const phoneNumber = computed(() => props.appointment.supplier.phone_number);

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const openModal = () => {
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
};
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

      svg {
        width: 1.5rem;
        height: 1.5rem;
      }

      label {
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

      svg {
        width: 1.5rem;
        height: 1.5rem;
        color: $color-text-secondary;
      }

      label {
        @include label-base;
        font-weight: 500;
        font-size: 0.875rem;
        line-height: 1.5rem;
        color: $color-text-secondary;
      }
    }
  }
}
</style>
