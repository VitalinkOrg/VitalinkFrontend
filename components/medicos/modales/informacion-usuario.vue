<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    class="user-information"
    @close="handleCloseModal"
  >
    <template #title>
      <h2 class="user-information__title">Información del Usuario</h2>
    </template>

    <div class="user-information__content">
      <div class="user-information__form-group">
        <label class="user-information__label">Foto de Perfil Publico</label>
        <div class="user-information__profile-image">
          <img :src="profileImage" alt="Profile" />
        </div>
      </div>

      <div class="user-information__form-group">
        <label class="user-information__label">Nombre y Apellido</label>
        <input
          type="text"
          :value="appointment.customer.name"
          class="user-information__input"
          disabled
        />
      </div>

      <div class="user-information__form-group">
        <label class="user-information__label">Email</label>
        <input
          type="email"
          :value="appointment.customer.email"
          class="user-information__input"
          disabled
        />
      </div>

      <div class="user-information__form-group">
        <label class="user-information__label">Número de teléfono</label>
        <input
          type="tel"
          :value="appointment.customer.phone_number"
          class="user-information__input"
          disabled
        />
      </div>

      <div class="user-information__form-group">
        <label class="user-information__label">Dirección</label>
        <input
          type="text"
          :value="appointment.customer.address"
          class="user-information__input"
          disabled
        />
      </div>

      <div class="form-group d-flex gap-2 justify-content-between">
        <div class="user-information__form-group">
          <label class="user-information__label">Código Postal</label>
          <input
            type="text"
            :value="appointment.customer.postal_code"
            class="user-information__input user-information__input--postal-code"
            disabled
          />
        </div>
        <div class="user-information__form-group">
          <label class="user-information__label">Ciudad</label>
          <input
            type="text"
            :value="appointment.customer.city_name"
            class="user-information__input"
            disabled
          />
        </div>
        <div class="user-information__form-group">
          <label class="user-information__label">País</label>
          <input
            type="text"
            :value="appointment.customer.country_iso_code"
            class="user-information__input"
            disabled
          />
        </div>
      </div>
    </div>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import defaultAvatar from "@/src/assets/picture.svg";
import type { Appointment } from "~/types";

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const profileImage = computed(() => {
  return props.appointment.customer.profile_picture_url || defaultAvatar;
});

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<style lang="scss" scoped>
.user-information {
  &__title {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0;
    color: #19213d;
  }

  &__content {
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 20px;
  }

  &__profile-image {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 130px;
    height: 132px;
    border-radius: 18px;
    border-width: 3px;
    border: 3px solid #c2c6e9;
    background-color: #f8faff;
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    @include form-label;
  }

  &__input {
    @include input-base;

    &--postal-code {
      max-width: 128px;
    }
  }
}
</style>
