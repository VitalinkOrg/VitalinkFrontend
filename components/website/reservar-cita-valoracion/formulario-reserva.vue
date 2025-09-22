<template>
  <div class="reservation-form">
    <div class="reservation-form__step-content">
      <h2 class="reservation-form__title">
        Completar Formulario antes de reservar
      </h2>

      <section
        class="reservation-form__section reservation-form__section--background"
      >
        <div class="reservation-form__field">
          <div class="reservation-form__field-header">
            <h3 class="reservation-form__field-title">Agregar Descripción</h3>
            <p class="reservation-form__field-description">
              Puedes agregar una descripción sobre la razón de tu reserva, datos
              importantes que el médico deba tener en cuenta o los síntomas y
              dolencias.
            </p>
          </div>
          <textarea
            class="reservation-form__textarea"
            placeholder="Escribe alguna descripción..."
            rows="4"
            @change="setUserDescription"
          ></textarea>
        </div>

        <fieldset class="reservation-form__fieldset">
          <legend class="reservation-form__legend">
            ¿Para quien es la cita?
          </legend>

          <div class="reservation-form__radio-group">
            <div class="reservation-form__radio-option">
              <input
                type="radio"
                name="appointmentFor"
                id="forMe"
                value="me"
                class="reservation-form__radio"
                @change="setIsForExternalUser"
                checked
              />
              <label for="forMe" class="reservation-form__radio-label"
                >Para mi</label
              >
            </div>

            <div class="reservation-form__radio-option">
              <input
                type="radio"
                name="appointmentFor"
                id="forSomeoneElse"
                value="someoneElse"
                class="reservation-form__radio"
                @change="setIsForExternalUser"
              />
              <label for="forSomeoneElse" class="reservation-form__radio-label"
                >Para otra persona</label
              >
            </div>
          </div>
        </fieldset>

        <div class="reservation-form__field">
          <div class="reservation-form__field-header">
            <h3 class="reservation-form__field-title">
              ¿Quieres Ser Contactado a Este Número?
            </h3>
            <p class="reservation-form__field-description">
              Hemos encontrado este número registrado en tu cuenta.
            </p>
          </div>

          <div class="reservation-form__input-group">
            <input
              type="text"
              id="phoneNumber"
              class="reservation-form__input"
              placeholder="+506 8765-4321"
              :value="phoneNumber"
              disabled
            />
          </div>

          <div class="reservation-form__switch-group">
            <input
              type="checkbox"
              id="useAlternativeNumber"
              class="reservation-form__switch"
              @change="toggleAlternativeNumber"
            />
            <label
              for="useAlternativeNumber"
              class="reservation-form__switch-label"
            >
              No, Quiero Usar Otro Número
            </label>
          </div>

          <div
            class="reservation-form__input-group reservation-form__input-group--conditional"
          >
            <label for="alternativePhoneNumber" class="reservation-form__label">
              Número de Teléfono
            </label>
            <input
              type="text"
              id="alternativePhoneNumber"
              class="reservation-form__input"
              placeholder="+506 8765-4321"
              :value="alternativePhoneNumber"
              @input="
                if ($event.target) {
                  $emit(
                    'set-alternative-phone-number',
                    ($event.target as HTMLInputElement).value
                  );
                }
              "
            />
          </div>
        </div>
      </section>

      <section class="reservation-form__section">
        <div class="reservation-form__payment-summary">
          <table class="reservation-form__table">
            <tbody class="reservation-form__table-body">
              <tr
                class="reservation-form__table-row reservation-form__table-row--header"
              >
                <td
                  class="reservation-form__table-cell reservation-form__table-cell--title"
                >
                  Resumen de pago:
                </td>
                <td class="reservation-form__table-cell"></td>
              </tr>
              <tr class="reservation-form__table-row">
                <td class="reservation-form__table-cell">Precio</td>
                <td
                  class="reservation-form__table-cell reservation-form__table-cell--amount"
                >
                  ₡18.000
                </td>
              </tr>
              <tr class="reservation-form__table-row">
                <td class="reservation-form__table-cell">Descuento</td>
                <td
                  class="reservation-form__table-cell reservation-form__table-cell--amount"
                >
                  -
                </td>
              </tr>
              <tr
                class="reservation-form__table-row reservation-form__table-row--total"
              >
                <td
                  class="reservation-form__table-cell reservation-form__table-cell--bold"
                >
                  Precio Final
                </td>
                <td
                  class="reservation-form__table-cell reservation-form__table-cell--bold reservation-form__table-cell--amount"
                >
                  ₡18.000
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  phoneNumber: string;
  alternativePhoneNumber: string | null;
}

interface Emits {
  (e: "is-for-external-user", person: "me" | "someoneElse"): void;
  (e: "set-alternative-phone-number", phone: string): void;
  (e: "set-user-description", description: string): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const setIsForExternalUser = (event: Event) => {
  const value = (event.target as HTMLInputElement).value as
    | "me"
    | "someoneElse";
  emit("is-for-external-user", value);
};

const setUserDescription = (event: Event) => {
  const description = (event.target as HTMLInputElement).value as
    | "me"
    | "someoneElse";
  emit("set-user-description", description);
};

const toggleAlternativeNumber = (event: Event): void => {
  const isChecked = (event.target as HTMLInputElement).checked;
  const alternativeInput = document.getElementById(
    "alternativePhoneNumber"
  ) as HTMLInputElement;

  if (isChecked) {
    alternativeInput.parentElement?.classList.add("active");
    emit("set-alternative-phone-number", alternativeInput.value);
  } else {
    alternativeInput.parentElement?.classList.remove("active");
    emit("set-alternative-phone-number", "");
  }
};
</script>

<style lang="scss" scoped>
.reservation-form {
  &__step-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    color: #353e5c;
  }

  &__section {
    display: flex;
    flex-direction: column;
    border-radius: 15px;
    gap: 24px;
    padding: 24px 20px 20px 20px;

    &--background {
      background: #f8faff;
      border: 1px solid #f1f3f7;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__field-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__field-title {
    @include label-base;
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    color: #353e5c;
  }

  &__field-description {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 22px;
    color: #6d758f;
  }

  &__textarea {
    @include input-base;
    min-height: 100px;
    resize: vertical;
    font-family: $font-family-main;
  }

  &__fieldset {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__legend {
    @include form-label;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: $color-foreground;
    padding: 0;
  }

  &__radio-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__radio-option {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__radio {
    @include custom-radio;

    &:checked {
      border-color: #0cadbb;

      &::after {
        background-color: #0cadbb;
      }
    }
  }

  &__radio-label {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 22px;
    color: #6d758f;
  }

  &__input-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    &--conditional {
      margin-top: $spacing-sm;
      opacity: 0.6;
      pointer-events: none;
      transition: opacity 0.2s ease;

      &.active {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  &__input {
    @include input-base;
  }

  &__label {
    @include form-label;
  }

  &__switch-group {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm 0;
  }

  &__switch {
    appearance: none;
    -webkit-appearance: none;
    width: 44px;
    height: 24px;
    background-color: #d1d5db;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
    outline: none;

    &:checked {
      background-color: $color-primary;

      &::after {
        transform: translateX(20px);
      }
    }

    &::after {
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      background-color: $white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.4);
    }
  }

  &__switch-label {
    @include label-base;
    font-weight: 600;
    font-size: 15px;
    line-height: 22px;
    color: #353e5c;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-family: $font-family-main;
  }

  &__table-row {
    &--header {
      .reservation-form__table-cell {
        font-weight: 600;
        font-size: 16px;
        color: $color-foreground;
        padding-bottom: $spacing-md;
      }
    }

    &--total {
      border-top: 1px solid #e4e7ec;

      .reservation-form__table-cell {
        padding-top: $spacing-md;
      }
    }

    &:not(.reservation-form__table-row--header):not(
        .reservation-form__table-row--total
      ) {
      .reservation-form__table-cell {
        padding: $spacing-xs 0;
      }
    }
  }

  &__table-cell {
    font-family: $font-family-main;
    text-align: left;
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    color: #6d758f;

    &--title {
      font-weight: 700;
      color: #353e5c;
    }

    &--amount {
      text-align: right;
      font-weight: 700;
      vertical-align: middle;
      color: $color-foreground;
    }

    &--bold {
      font-weight: 600;
      font-size: 20px;
      line-height: 20px;
      vertical-align: middle;
      color: $color-foreground;
    }
  }
}
</style>
