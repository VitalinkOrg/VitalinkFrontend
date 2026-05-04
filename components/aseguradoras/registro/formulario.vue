<template>
  <section class="registration">
    <form @submit.prevent="handleRegister" class="registration__form">
      <div class="registration__container">
        <h1 class="registration__title">Crear cuenta</h1>

        <fieldset class="registration__fieldset">
          <legend class="registration__legend">Datos del usuario</legend>
          <div class="registration__separator"></div>

          <div class="registration__row registration__row--two-columns">
            <div class="registration__field">
              <label for="id_type" class="registration__label"
                >Tipo de identificación</label
              >
              <UiDropdownBase
                id="id_type"
                :model-value="registerData.id_type"
                :items="idTypeOptions"
                :class="{ 'registration__input--error': errors.id_type }"
                placeholder="Selecciona un tipo"
                @update:model-value="registerData.id_type = $event as string"
              />
              <span v-if="errors.id_type" class="registration__error">{{
                errors.id_type
              }}</span>
            </div>

            <div class="registration__field">
              <label for="card_id" class="registration__label"
                >Número de identificación</label
              >
              <input
                v-model="registerData.card_id"
                type="text"
                class="registration__input"
                :class="{ 'registration__input--error': errors.card_id }"
                placeholder="Ej: 102220333"
                id="card_id"
                required
              />
              <span v-if="errors.card_id" class="registration__error">{{
                errors.card_id
              }}</span>
            </div>
          </div>

          <div class="registration__field">
            <label for="nombre" class="registration__label">Nombre</label>
            <input
              v-model="registerData.name"
              type="text"
              class="registration__input"
              :class="{ 'registration__input--error': errors.name }"
              placeholder="Escribe tu nombre"
              id="nombre"
              required
            />
            <span v-if="errors.name" class="registration__error">{{
              errors.name
            }}</span>
          </div>

          <div class="registration__row registration__row--three-columns">
            <div class="registration__field">
              <label for="codigo-postal" class="registration__label"
                >Código Postal</label
              >
              <input
                v-model="registerData.postal_code"
                type="text"
                class="registration__input"
                :class="{ 'registration__input--error': errors.postal_code }"
                placeholder="000000"
                id="codigo-postal"
              />
              <span v-if="errors.postal_code" class="registration__error">{{
                errors.postal_code
              }}</span>
            </div>

            <div class="registration__field">
              <label for="ciudad" class="registration__label">Ciudad</label>
              <input
                v-model="registerData.city_name"
                type="text"
                class="registration__input"
                :class="{ 'registration__input--error': errors.city_name }"
                placeholder="Ciudad"
                id="ciudad"
              />
              <span v-if="errors.city_name" class="registration__error">{{
                errors.city_name
              }}</span>
            </div>

            <div class="registration__field">
              <label for="pais" class="registration__label">País</label>
              <input
                v-model="registerData.country_iso_code"
                type="text"
                class="registration__input"
                :class="{
                  'registration__input--error': errors.country_iso_code,
                }"
                placeholder="Ej: CR, US"
                id="pais"
              />
              <span
                v-if="errors.country_iso_code"
                class="registration__error"
                >{{ errors.country_iso_code }}</span
              >
            </div>
          </div>
        </fieldset>

        <fieldset class="registration__fieldset">
          <legend class="registration__legend">Datos de la cuenta</legend>
          <div class="registration__separator"></div>

          <div class="registration__field">
            <label for="email" class="registration__label"
              >Correo Electrónico</label
            >
            <input
              v-model="registerData.email"
              type="email"
              class="registration__input"
              :class="{ 'registration__input--error': errors.email }"
              placeholder="Escribe tu correo electrónico"
              id="email"
              required
            />
            <span v-if="errors.email" class="registration__error">{{
              errors.email
            }}</span>
          </div>

          <div class="registration__row registration__row--two-columns">
            <div class="registration__field">
              <label for="password" class="registration__label"
                >Contraseña</label
              >
              <input
                v-model="registerData.password"
                type="password"
                class="registration__input"
                :class="{ 'registration__input--error': errors.password }"
                id="password"
                placeholder="Escribe tu contraseña"
                required
              />
              <span v-if="errors.password" class="registration__error">{{
                errors.password
              }}</span>
            </div>

            <div class="registration__field">
              <label for="confirmar-password" class="registration__label"
                >Confirmar Contraseña</label
              >
              <input
                v-model="registerData.passwordConfirmation"
                type="password"
                class="registration__input"
                :class="{
                  'registration__input--error': errors.passwordConfirmation,
                }"
                id="confirmar-password"
                placeholder="Escribe tu contraseña"
                name="passwordConfirmation"
                required
              />
              <span
                v-if="errors.passwordConfirmation"
                class="registration__error"
                >{{ errors.passwordConfirmation }}</span
              >
            </div>
          </div>
        </fieldset>

        <template v-if="!registered">
          <button
            type="submit"
            class="registration__button registration__button--primary"
            :disabled="isLoading"
          >
            Siguiente
          </button>

          <div class="registration__separator"></div>

          <p class="registration__login-prompt">
            <span class="registration__login-text">Ya tienes Cuenta? </span>
            <NuxtLink href="/auth/login" class="registration__login-link">
              Iniciar Sesión
            </NuxtLink>
          </p>
        </template>

        <div v-else class="registration__success">
          <p class="registration__success-title">
            ¡Cuenta creada exitosamente!
          </p>
          <p class="registration__success-text">
            Revisa tu correo electrónico y sigue las instrucciones para
            verificar tu cuenta.
          </p>
        </div>
      </div>
    </form>
  </section>
</template>

<script lang="ts" setup>
import { useInsuranceAuth } from "~/composables/api/useInsuranceAuth";

const { registerInsurance } = useInsuranceAuth();
const toast = useToast();

const idTypeOptions = [
  { value: "PHYSICAL_DNI", label: "Cédula física" },
  { value: "JURIDICAL_DNI", label: "Cédula jurídica" },
  { value: "DIMEX", label: "DIMEX" },
  { value: "PASSPORT", label: "Pasaporte" },
];

const isLoading = ref<boolean>(false);
const registered = ref<boolean>(false);

interface RegisterFormData extends Omit<IRegisterRequest, "gender"> {
  passwordConfirmation: string;
}

const registerData = ref<RegisterFormData>({
  card_id: "",
  id_type: "",
  name: "",
  email: "",
  password: "",
  role_code: "FINANCE_ENTITY",
  postal_code: "",
  city_name: "",
  country_iso_code: "",
  passwordConfirmation: "",
});

const errors = ref({
  card_id: "",
  id_type: "",
  name: "",
  email: "",
  password: "",
  postal_code: "",
  city_name: "",
  country_iso_code: "",
  passwordConfirmation: "",
});

const validateField = (field: string, value: string) => {
  switch (field) {
    case "card_id":
      errors.value.card_id = !value.trim()
        ? "El número de identificación es obligatorio"
        : "";
      break;

    case "id_type":
      errors.value.id_type = !value
        ? "El tipo de identificación es obligatorio"
        : "";
      break;

    case "name":
      if (!value.trim()) {
        errors.value.name = "El nombre es obligatorio";
      } else if (value.trim().length < 2) {
        errors.value.name = "El nombre debe tener al menos 2 caracteres";
      } else {
        errors.value.name = "";
      }
      break;

    case "email":
      if (!value.trim()) {
        errors.value.email = "El correo electrónico es obligatorio";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.value.email = "Formato de correo electrónico inválido";
      } else {
        errors.value.email = "";
      }
      break;

    case "password":
      if (!value) {
        errors.value.password = "La contraseña es obligatoria";
      } else if (value.length < 8) {
        errors.value.password =
          "La contraseña debe tener al menos 8 caracteres";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        errors.value.password =
          "La contraseña debe contener al menos una mayúscula, una minúscula y un número";
      } else {
        errors.value.password = "";
      }
      break;

    case "passwordConfirmation":
      if (!value) {
        errors.value.passwordConfirmation = "Confirma tu contraseña";
      } else if (value !== registerData.value.password) {
        errors.value.passwordConfirmation = "Las contraseñas no coinciden";
      } else {
        errors.value.passwordConfirmation = "";
      }
      break;
  }
};

const handleRegister = async () => {
  Object.keys(errors.value).forEach((key) => {
    errors.value[key as keyof typeof errors.value] = "";
  });

  const fieldsToValidate = [
    "card_id",
    "id_type",
    "name",
    "email",
    "password",
    "passwordConfirmation",
  ];
  fieldsToValidate.forEach((field) => {
    validateField(
      field,
      (registerData.value[
        field as keyof typeof registerData.value
      ] as string) ?? "",
    );
  });

  if (Object.values(errors.value).some((e) => e !== "")) return;

  isLoading.value = true;

  const { passwordConfirmation, ...rest } = registerData.value;
  const payload: IRegisterRequest = { ...rest, gender: "O" };
  const { request, error } = registerInsurance(payload);

  await request();

  isLoading.value = false;

  if (error.value) {
    console.error("[socio-financiero/registro] Registration failed:", {
      payload,
      error: error.value,
    });
    const httpCode = error.value.status?.http_code;
    if (httpCode === 409) {
      errors.value.email = "Este correo electrónico ya está registrado";
    } else {
      toast.error(
        error.value.info ||
          "Ocurrió un error al crear la cuenta. Por favor, inténtalo de nuevo.",
      );
    }
    return;
  }

  registered.value = true;
};
</script>

<style lang="scss" scoped>
.registration {
  &__form {
    width: 100%;
    max-width: 38.75rem;
  }

  &__title {
    @include text-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.4;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
  }

  &__fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  &__legend {
    @include text-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.4;
    letter-spacing: -0.02em;
    color: #333333;
    margin-bottom: 0.5rem;
    padding: 0;
  }

  &__separator {
    background-color: #e1e4ed;
    height: 0.0625rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  &__row {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;

    &--two-columns {
      grid-template-columns: repeat(2, 1fr);

      @media (max-width: 48rem) {
        grid-template-columns: 1fr;
      }
    }

    &--three-columns {
      grid-template-columns: repeat(3, 1fr);

      @media (max-width: 48rem) {
        grid-template-columns: 1fr;
      }

      @media (min-width: 48.0625rem) and (max-width: 64rem) {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.375rem;
    margin-bottom: 1rem;
  }

  &__label {
    @include form-label;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #344054;
  }

  &__input {
    @include input-base;
    padding: 0.625rem 0.875rem;
    font-weight: 300;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0;
    width: 100%;

    &:hover {
      border: 1px solid $color-primary;
    }

    &--error {
      border-color: #dc2626;
      box-shadow: 0 0 0 0.1875rem rgba(220, 38, 38, 0.1);
    }
  }

  &__error {
    font-size: 0.75rem;
    color: #dc2626;
    margin-top: 0.25rem;
    font-weight: 400;
    line-height: 1rem;
  }

  &__button {
    width: 100%;
    margin-bottom: 1.5rem;

    &--primary {
      @include primary-button;
      padding: 1rem 1.75rem;
      border-radius: 1.25rem;
    }
  }

  &__login-prompt {
    text-align: center;
    margin: 0;
    padding: 1rem 0 0 0;
  }

  &__login-text {
    color: #6b7280;
    font-size: 0.875rem;
  }

  &__login-link {
    color: #1f2937;
    font-weight: 500;
    text-decoration: none;
    font-size: 0.875rem;

    &:hover {
      text-decoration: underline;
      color: #111827;
    }
  }

  &__success {
    padding: 1.5rem;
    border-radius: 0.75rem;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    text-align: center;
  }

  &__success-title {
    font-weight: 600;
    font-size: 1rem;
    color: #15803d;
    margin-bottom: 0.5rem;
  }

  &__success-text {
    font-size: 0.875rem;
    color: #166534;
    line-height: 1.5;
    margin: 0;
  }
}
</style>
