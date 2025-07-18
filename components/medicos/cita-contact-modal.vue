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
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_5762_38237)">
                <path
                  d="M18.3332 14.1002V16.6002C18.3341 16.8322 18.2866 17.062 18.1936 17.2746C18.1006 17.4873 17.9643 17.6782 17.7933 17.835C17.6222 17.9919 17.4203 18.1114 17.2005 18.1858C16.9806 18.2601 16.7477 18.2877 16.5165 18.2668C13.9522 17.9882 11.489 17.1119 9.32486 15.7085C7.31139 14.429 5.60431 12.722 4.32486 10.7085C2.91651 8.5345 2.04007 6.05932 1.76653 3.4835C1.7457 3.25305 1.77309 3.0208 1.84695 2.80152C1.9208 2.58224 2.03951 2.38074 2.1955 2.20985C2.3515 2.03896 2.54137 1.90242 2.75302 1.80893C2.96468 1.71544 3.19348 1.66705 3.42486 1.66683H5.92486C6.32928 1.66285 6.72136 1.80606 7.028 2.06977C7.33464 2.33348 7.53493 2.6997 7.59153 3.10016C7.69705 3.90022 7.89274 4.68577 8.17486 5.44183C8.28698 5.7401 8.31125 6.06426 8.24478 6.3759C8.17832 6.68753 8.02392 6.97359 7.79986 7.20016L6.74153 8.2585C7.92783 10.3448 9.65524 12.0722 11.7415 13.2585L12.7999 12.2002C13.0264 11.9761 13.3125 11.8217 13.6241 11.7552C13.9358 11.6888 14.2599 11.713 14.5582 11.8252C15.3143 12.1073 16.0998 12.303 16.8999 12.4085C17.3047 12.4656 17.6744 12.6695 17.9386 12.9814C18.2029 13.2933 18.3433 13.6915 18.3332 14.1002Z"
                  stroke="#FCFCFD"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_5762_38237">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </span>
          <button
            class="modal-close-button"
            @click="emit('close-modal')"
            aria-label="Cerrar modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-hidden="true"
            >
              <path
                d="M17 7L7 17M17 17L7 7"
                stroke="black"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <h5 class="modal-body__title">Contacta con el paciente ahora:</h5>

          <!-- Mocked Information -->
          <div class="modal-body__information">
            <div class="modal-body__information--row">
              <div class="modal-body__information--icon">
                <img
                  src="@/src/assets/globe.svg"
                  height="20px"
                  width="20px"
                  alt="Alerta"
                />
                <label for="tipo"> Tipo </label>
              </div>
              <div class="modal-body__information--content">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_5762_38204)">
                    <path
                      d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                      fill="#F0F0F0"
                    />
                    <path
                      d="M23.2536 7.82617H0.746391C0.264047 9.12616 0 10.5322 0 12.0001C0 13.4679 0.264047 14.874 0.746391 16.174H23.2537C23.736 14.874 24 13.4679 24 12.0001C24 10.5322 23.736 9.12616 23.2536 7.82617Z"
                      fill="#D80027"
                    />
                    <path
                      d="M12.0009 -0.000488281C8.36383 -0.000488281 5.10494 1.61782 2.9043 4.1734H21.0975C18.8969 1.61782 15.638 -0.000488281 12.0009 -0.000488281Z"
                      fill="#0052B4"
                    />
                    <path
                      d="M21.0965 19.8262H2.90332C5.10396 22.3818 8.36285 24.0001 11.9999 24.0001C15.637 24.0001 18.8959 22.3818 21.0965 19.8262Z"
                      fill="#0052B4"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_5762_38204">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

                <label class="form-check-label" for="numeroCostaRica">
                  Número de Costa Rica
                </label>
              </div>
            </div>
            <div class="modal-body__information--row">
              <div class="modal-body__information--icon">
                <img
                  src="@/src/assets/call-out.svg"
                  alt="Alerta"
                  height="20px"
                  width="20px"
                />
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

console.log(props);
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

      img {
        width: 24px;
        height: 24px;
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
