<template>
  <Teleport to="body">
    <div
      v-if="appointment"
      class="modal-backdrop"
      @click.self="emit('close-modal')"
      @keydown.esc="emit('close-modal')"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="modalTitleId"
      tabindex="-1"
    >
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-content__header">
          <span class="modal-content__header--icon">
            <AtomsIconsPhoneIcon />
          </span>
          <button
            class="modal-close-button"
            @click="emit('close-modal')"
            aria-label="Cerrar modal"
          >
            <AtomsIconsXIcon />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <h5 class="modal-body__title">Contacta con el paciente ahora:</h5>

          <!-- Mocked Information -->
          <div class="modal-body__information">
            <div class="modal-body__information--row">
              <div class="modal-body__information--icon">
                <AtomsIconsGlobeIcon />
                <label for="tipo"> Tipo </label>
              </div>
              <div class="modal-body__information--content">
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
            <div class="modal-body__information--row">
              <div class="modal-body__information--icon">
                <AtomsIconsPhoneOutgoingIcon />
                <label for="tipo"> N° de teléfono </label>
              </div>
              <div class="modal-body__information--content">
                <label class="form-check-label" for="numeroCostaRica">
                  (1555) 52184931545
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { defineProps } from "vue";
const emit = defineEmits(["close-modal"]);
const props = defineProps(["appointment", "open"]);
</script>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  &-content {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: auto;

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
  }

  &-close-button {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 24px;
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    cursor: pointer;
  }
}

.modal-body {
  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    color: #19213d;
  }

  &__information {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;

    &--row {
      display: flex;
      justify-content: space-between;
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

    &--content {
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
  }
}
</style>
