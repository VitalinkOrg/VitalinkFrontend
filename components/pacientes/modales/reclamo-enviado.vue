<template>
  <AtomsModalBase :is-open="isOpen" size="extra-small" @close="closeModal">
    <div class="claim-sent__body">
      <div class="claim-sent__header">
        <AtomsIconsCheckIcon size="20" class="claim-sent__header-icon" />
      </div>
      <h2 class="claim-sent__title">¡Genial!</h2>
      <p class="claim-sent__highlight">Tu reclamo se ha enviado con éxito</p>
      <p class="claim-sent__description">
        Nos pondremos en contacto contigo lo más pronto posible
      </p>
    </div>
    <template #footer>
      <div class="claim-sent__actions">
        <button class="claim-sent__button--outline">Volver</button>
        <button class="claim-sent__button--primary">Ir a Home</button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
const isOpen = ref<boolean>(false);

const openModal = () => {
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
};

defineExpose({
  openModal,
  closeModal,
});
</script>

<style lang="scss" scoped>
.claim-sent {
  &__header {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  &__header-icon {
    background: #0cadbb;
    border: 8px solid #c2ebee;
    border-radius: 50%;
    color: $white;
    padding: 4px;
    width: 48px;
    height: 48px;
    margin: 0 auto;
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 1rem;
    gap: 8px;
  }

  &__title {
    font-weight: 600;
    font-size: 32px;
    line-height: 28px;
    letter-spacing: 0;
    text-align: center;
    color: #0cadbb;
    margin: 8px 0;
  }

  &__highlight {
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0;
    text-align: center;
    color: #353e5c;
    margin: 0;
  }

  &__description {
    font-weight: 500;
    font-style: Medium;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0;
    text-align: center;
    color: #6d758f;
    margin: 0;
    max-width: 260px;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
  }

  &__button--outline {
    @include outline-button;
    flex: 1;
  }

  &__button--primary {
    @include primary-button;
    flex: 1;
  }
}
</style>
