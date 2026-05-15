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
              <UiDropdownBase
                id="pais"
                :model-value="registerData.country_iso_code"
                :items="countryOptions"
                :error="!!errors.country_iso_code"
                :searchable="true"
                placeholder="Selecciona un país"
                @update:model-value="registerData.country_iso_code = $event as string"
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
              <div class="registration__input-wrapper">
                <input
                  v-model="registerData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="registration__input registration__input--with-icon"
                  :class="{ 'registration__input--error': errors.password }"
                  id="password"
                  placeholder="Escribe tu contraseña"
                  required
                />
                <button
                  type="button"
                  class="registration__eye-button"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <AtomsIconsEyeOffIcon v-if="showPassword" />
                  <AtomsIconsEyeIcon v-else />
                </button>
              </div>
              <span v-if="errors.password" class="registration__error">{{
                errors.password
              }}</span>
            </div>

            <div class="registration__field">
              <label for="confirmar-password" class="registration__label"
                >Confirmar Contraseña</label
              >
              <div class="registration__input-wrapper">
                <input
                  v-model="registerData.passwordConfirmation"
                  :type="showPasswordConfirmation ? 'text' : 'password'"
                  class="registration__input registration__input--with-icon"
                  :class="{
                    'registration__input--error': errors.passwordConfirmation,
                  }"
                  id="confirmar-password"
                  placeholder="Escribe tu contraseña"
                  name="passwordConfirmation"
                  required
                />
                <button
                  type="button"
                  class="registration__eye-button"
                  @click="showPasswordConfirmation = !showPasswordConfirmation"
                  :aria-label="showPasswordConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <AtomsIconsEyeOffIcon v-if="showPasswordConfirmation" />
                  <AtomsIconsEyeIcon v-else />
                </button>
              </div>
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

const countryOptions = [
  { value: "AF", label: "Afganistán" },
  { value: "AL", label: "Albania" },
  { value: "DE", label: "Alemania" },
  { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" },
  { value: "AG", label: "Antigua y Barbuda" },
  { value: "SA", label: "Arabia Saudita" },
  { value: "DZ", label: "Argelia" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaiyán" },
  { value: "BS", label: "Bahamas" },
  { value: "BD", label: "Bangladés" },
  { value: "BB", label: "Barbados" },
  { value: "BH", label: "Baréin" },
  { value: "BE", label: "Bélgica" },
  { value: "BZ", label: "Belice" },
  { value: "BJ", label: "Benín" },
  { value: "BY", label: "Bielorrusia" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia y Herzegovina" },
  { value: "BW", label: "Botsuana" },
  { value: "BR", label: "Brasil" },
  { value: "BN", label: "Brunéi" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BI", label: "Burundi" },
  { value: "BT", label: "Bután" },
  { value: "CV", label: "Cabo Verde" },
  { value: "KH", label: "Camboya" },
  { value: "CM", label: "Camerún" },
  { value: "CA", label: "Canadá" },
  { value: "QA", label: "Catar" },
  { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CY", label: "Chipre" },
  { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoras" },
  { value: "CG", label: "Congo" },
  { value: "CD", label: "Congo (R. D.)" },
  { value: "KP", label: "Corea del Norte" },
  { value: "KR", label: "Corea del Sur" },
  { value: "CI", label: "Costa de Marfil" },
  { value: "CR", label: "Costa Rica" },
  { value: "HR", label: "Croacia" },
  { value: "CU", label: "Cuba" },
  { value: "DK", label: "Dinamarca" },
  { value: "DJ", label: "Yibuti" },
  { value: "DM", label: "Dominica" },
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egipto" },
  { value: "SV", label: "El Salvador" },
  { value: "AE", label: "Emiratos Árabes Unidos" },
  { value: "ER", label: "Eritrea" },
  { value: "SK", label: "Eslovaquia" },
  { value: "SI", label: "Eslovenia" },
  { value: "ES", label: "España" },
  { value: "US", label: "Estados Unidos" },
  { value: "EE", label: "Estonia" },
  { value: "ET", label: "Etiopía" },
  { value: "FJ", label: "Fiyi" },
  { value: "PH", label: "Filipinas" },
  { value: "FI", label: "Finlandia" },
  { value: "FR", label: "Francia" },
  { value: "GA", label: "Gabón" },
  { value: "GM", label: "Gambia" },
  { value: "GE", label: "Georgia" },
  { value: "GH", label: "Ghana" },
  { value: "GD", label: "Granada" },
  { value: "GR", label: "Grecia" },
  { value: "GT", label: "Guatemala" },
  { value: "GN", label: "Guinea" },
  { value: "GQ", label: "Guinea Ecuatorial" },
  { value: "GW", label: "Guinea-Bisáu" },
  { value: "GY", label: "Guyana" },
  { value: "HT", label: "Haití" },
  { value: "HN", label: "Honduras" },
  { value: "HU", label: "Hungría" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IQ", label: "Irak" },
  { value: "IR", label: "Irán" },
  { value: "IE", label: "Irlanda" },
  { value: "IS", label: "Islandia" },
  { value: "MH", label: "Islas Marshall" },
  { value: "SB", label: "Islas Salomón" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italia" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japón" },
  { value: "JO", label: "Jordania" },
  { value: "KZ", label: "Kazajistán" },
  { value: "KE", label: "Kenia" },
  { value: "KG", label: "Kirguistán" },
  { value: "KI", label: "Kiribati" },
  { value: "KW", label: "Kuwait" },
  { value: "LA", label: "Laos" },
  { value: "LS", label: "Lesoto" },
  { value: "LV", label: "Letonia" },
  { value: "LB", label: "Líbano" },
  { value: "LR", label: "Liberia" },
  { value: "LY", label: "Libia" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lituania" },
  { value: "LU", label: "Luxemburgo" },
  { value: "MK", label: "Macedonia del Norte" },
  { value: "MG", label: "Madagascar" },
  { value: "MY", label: "Malasia" },
  { value: "MW", label: "Malaui" },
  { value: "MV", label: "Maldivas" },
  { value: "ML", label: "Malí" },
  { value: "MT", label: "Malta" },
  { value: "MA", label: "Marruecos" },
  { value: "MU", label: "Mauricio" },
  { value: "MR", label: "Mauritania" },
  { value: "MX", label: "México" },
  { value: "FM", label: "Micronesia" },
  { value: "MD", label: "Moldavia" },
  { value: "MC", label: "Mónaco" },
  { value: "MN", label: "Mongolia" },
  { value: "ME", label: "Montenegro" },
  { value: "MZ", label: "Mozambique" },
  { value: "MM", label: "Myanmar" },
  { value: "NA", label: "Namibia" },
  { value: "NR", label: "Nauru" },
  { value: "NP", label: "Nepal" },
  { value: "NI", label: "Nicaragua" },
  { value: "NE", label: "Níger" },
  { value: "NG", label: "Nigeria" },
  { value: "NO", label: "Noruega" },
  { value: "NZ", label: "Nueva Zelanda" },
  { value: "OM", label: "Omán" },
  { value: "NL", label: "Países Bajos" },
  { value: "PK", label: "Pakistán" },
  { value: "PW", label: "Palaos" },
  { value: "PA", label: "Panamá" },
  { value: "PG", label: "Papúa Nueva Guinea" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Perú" },
  { value: "PL", label: "Polonia" },
  { value: "PT", label: "Portugal" },
  { value: "GB", label: "Reino Unido" },
  { value: "CF", label: "República Centroafricana" },
  { value: "CZ", label: "República Checa" },
  { value: "DO", label: "República Dominicana" },
  { value: "RW", label: "Ruanda" },
  { value: "RO", label: "Rumanía" },
  { value: "RU", label: "Rusia" },
  { value: "WS", label: "Samoa" },
  { value: "KN", label: "San Cristóbal y Nieves" },
  { value: "SM", label: "San Marino" },
  { value: "VC", label: "San Vicente y las Granadinas" },
  { value: "LC", label: "Santa Lucía" },
  { value: "ST", label: "Santo Tomé y Príncipe" },
  { value: "SN", label: "Senegal" },
  { value: "RS", label: "Serbia" },
  { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leona" },
  { value: "SG", label: "Singapur" },
  { value: "SY", label: "Siria" },
  { value: "SO", label: "Somalia" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SZ", label: "Suazilandia" },
  { value: "ZA", label: "Sudáfrica" },
  { value: "SD", label: "Sudán" },
  { value: "SS", label: "Sudán del Sur" },
  { value: "SE", label: "Suecia" },
  { value: "CH", label: "Suiza" },
  { value: "SR", label: "Surinam" },
  { value: "TH", label: "Tailandia" },
  { value: "TZ", label: "Tanzania" },
  { value: "TJ", label: "Tayikistán" },
  { value: "TL", label: "Timor Oriental" },
  { value: "TG", label: "Togo" },
  { value: "TO", label: "Tonga" },
  { value: "TT", label: "Trinidad y Tobago" },
  { value: "TN", label: "Túnez" },
  { value: "TM", label: "Turkmenistán" },
  { value: "TR", label: "Turquía" },
  { value: "TV", label: "Tuvalu" },
  { value: "UA", label: "Ucrania" },
  { value: "UG", label: "Uganda" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistán" },
  { value: "VU", label: "Vanuatu" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnam" },
  { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabue" },
];

const isLoading = ref<boolean>(false);
const registered = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const showPasswordConfirmation = ref<boolean>(false);

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
    const errorCode =
      error.value.data && typeof error.value.data === "object"
        ? (error.value.data as IApiErrorData).code
        : null;

    if (httpCode === 409 || errorCode === "ER_DUP_ENTRY") {
      errors.value.email =
        "Este correo electrónico ya está registrado. Intenta iniciar sesión.";
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

  &__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
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

    &--with-icon {
      padding-right: 2.5rem;
    }
  }

  &__eye-button {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #6b7280;
    display: flex;
    align-items: center;

    &:hover {
      color: #374151;
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
