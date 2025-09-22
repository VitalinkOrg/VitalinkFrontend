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
                formatPhone(appointment.customer.phone_number, {
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

interface Props {
  appointment: Appointment;
}

defineProps<Props>();

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
    border-radius: 8px;
    padding: 0;
    color: #667085;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background-color: #f9fafb;
    }
  }

  &__content {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: auto;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 24px;

    &--icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 39px;
      height: 39px;
      background-color: #3541b4;
      border-radius: 100%;
      border: 6.5px solid #ebecf7;
      color: #fff;
      box-sizing: content-box;
      transform: translateX(-3px) translateY(-3px);

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    color: #19213d;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;

    &--label {
      display: flex;
      justify-content: space-between;
    }

    &--value {
      display: flex;
      gap: 10px;

      svg {
        width: 24px;
        height: 24px;
      }

      label {
        @include label-base;
        font-weight: 500;
        font-size: 14px;
        line-height: 24px;
        color: #19213d;
      }
    }

    &--icon {
      display: flex;
      gap: 10px;

      svg {
        width: 24px;
        height: 24px;
        color: #6d758f;
      }

      label {
        @include label-base;
        font-weight: 500;
        font-size: 14px;
        line-height: 24px;
        color: #6d758f;
      }
    }
  }
}
</style>
