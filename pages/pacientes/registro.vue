<template>
  <NuxtLayout name="pacientes-login">
    <h1 class="fw-semibold fs-2">Registrarse</h1>
    <p class="text-muted fw-light fs-56">Es gratis y fácil</p>

    <!-- navigation options -->
    <section>
      <!-- breadcrumb -->
      <!-- breadcum idCard -->
      <nav aria-label="breadcrumb" v-if="signupOption == 'idCard'">
        <ol class="breadcrumb">
          <!-- register type -->
          <li
            v-if="
              breadcrumOption == 'registerType' ||
              breadcrumOption == 'idCard' ||
              breadcrumOption == 'personalInfo' ||
              breadcrumOption == 'create'
            "
            class="breadcrumb-item"
            aria-current="page"
            :class="{
              'breadcrumb-selected': breadcrumOption == 'registerType',
            }"
            @click="
              breadcrumOption = 'registerType';
              signupOption = null;
            "
            style="cursor: pointer"
          >
            Tipo de registro
          </li>
          <!-- id card -->
          <li
            v-if="
              breadcrumOption == 'idCard' ||
              breadcrumOption == 'personalInfo' ||
              breadcrumOption == 'create'
            "
            view="idCard"
            class="breadcrumb-item"
            aria-current="page"
            :class="{
              'breadcrumb-selected': breadcrumOption == 'idCard',
            }"
            @click="breadcrumOption = 'idCard'"
            style="cursor: pointer"
          >
            Cédula
          </li>
          <!-- personal info -->
          <li
            v-if="
              breadcrumOption == 'personalInfo' || breadcrumOption == 'create'
            "
            class="breadcrumb-item"
            aria-current="page"
            :class="{
              'breadcrumb-selected': breadcrumOption == 'personalInfo',
            }"
            @click="breadcrumOption = 'personalInfo'"
            style="cursor: pointer"
          >
            Información personal
          </li>
          <!-- create account -->
          <li
            v-if="breadcrumOption == 'create'"
            class="breadcrumb-item"
            aria-current="page"
            :class="{
              'breadcrumb-selected': breadcrumOption == 'create',
            }"
            @click="breadcrumOption = 'create'"
            style="cursor: pointer"
          >
            Creación de la cuenta
          </li>
        </ol>
      </nav>

      <!-- breadcum email-->
      <nav aria-label="breadcrumb" v-if="signupOption == 'email'">
        <ol class="breadcrumb">
          <!-- register type -->
          <li
            v-if="
              breadcrumOption == 'registerType' || breadcrumOption == 'create'
            "
            class="breadcrumb-item"
            aria-current="page"
            :class="{
              'breadcrumb-selected': breadcrumOption == 'registerType',
            }"
            @click="
              breadcrumOption = 'registerType';
              signupOption = null;
            "
            style="cursor: pointer"
          >
            Tipo de registro
          </li>
          <!-- create account -->
          <li
            v-if="breadcrumOption == 'create'"
            class="breadcrumb-item"
            aria-current="page"
            :class="{
              'breadcrumb-selected': breadcrumOption == 'create',
            }"
            @click="breadcrumOption = 'create'"
            style="cursor: pointer"
          >
            Creación de la cuenta
          </li>
        </ol>
      </nav>

      <!-- option register -->
      <div v-if="signupOption == null">
        <div class="form-check">
          <div>
            <input
              class="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault1"
              value="idCard"
              v-model="selectedOption"
            />
            <label class="form-check-label" for="flexRadioDefault1">
              Registrarme con cédula
            </label>
          </div>

          <div>
            <input
              class="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="flexRadioDefault2"
              value="email"
              v-model="selectedOption"
            />
            <label class="form-check-label" for="flexRadioDefault2">
              Registrarme con correo electrónico
            </label>
          </div>
        </div>

        <div>
          <!-- button type signup -->
          <button
            v-if="selectedOption == 'idCard'"
            type="submit"
            class="btn btn-primary w-100 mt-4"
            @click="
              signupOption = selectedOption;
              setNavigationIdCardSeccion({
                current: 'registerType',
                action: 'next',
              });
            "
          >
            Continuar
          </button>

          <button
            v-else
            type="submit"
            class="btn btn-primary w-100 mt-4"
            @click="
              signupOption = selectedOption;
              setNavigationEmailSeccion({
                current: 'registerType',
                action: 'next',
              });
            "
          >
            Continuar
          </button>
        </div>
      </div>
    </section>

    <!-- forms -->
    <section v-if="signupOption != null">
      <!-- register with email -->
      <div v-if="signupOption == 'email'">
        <form @submit.prevent="register">
          <div class="form-group mb-4">
            <label for="nombre" class="form-label text-capitalize"
              >Tu Nombre</label
            >
            <input
              v-model="name"
              type="text"
              class="form-control"
              id="nombre"
              aria-describedby="nombreHelp"
              placeholder="Escribe tu nombre"
              required
            />
          </div>
          <div class="form-group mb-4">
            <label for="email" class="form-label text-capitalize"
              >Tu correo electrónico</label
            >
            <input
              v-model="email"
              type="email"
              class="form-control"
              id="email"
              aria-describedby="emailHelp"
              placeholder="Tu correo electrónico"
              required
            />
          </div>
          <div class="form-group mb-4">
            <label for="password" class="form-label text-capitalize"
              >Contraseña</label
            >
            <input
              v-model="password"
              type="password"
              class="form-control"
              id="password"
              placeholder="Escribe tu contraseña"
              aria-describedby="passwordHelp"
              required
            />
            <div id="passwordHelp" class="form-text">
              Deben ser 8 caracteres como mínimo
            </div>
          </div>
          <div class="form-group mb-4">
            <label for="password" class="form-label text-capitalize"
              >Confirmar Contraseña</label
            >
            <input
              v-model="confirmPassword"
              type="password"
              class="form-control"
              id="password"
              placeholder="Repite tu contraseña"
              aria-describedby="passwordHelp"
              required
            />
            <div id="passwordHelp" class="form-text">
              Deben ser 8 caracteres como mínimo
            </div>
          </div>
          <div class="form-group mb-4">
            <label for="phone" class="form-label text-capitalize"
              >Número de teléfono</label
            >
            <input
              v-model="phoneNumber"
              type="tel"
              class="form-control"
              id="phone"
              placeholder="Tu número de teléfono"
              required
            />
          </div>
          <div class="form-group mb-4">
            <label for="gender" class="form-label text-capitalize"
              >Género</label
            >
            <select v-model="gender" class="form-control" id="gender" required>
              <option value="">Seleccione un género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
          <div class="form-group mb-4">
            <label for="country" class="form-label text-capitalize">País</label>
            <input
              v-model="countryIsoCode"
              type="text"
              class="form-control"
              id="country"
              placeholder="Código ISO del país (ej: CRC)"
              required
            />
          </div>
          <div class="form-group mb-4">
            <label for="province" class="form-label text-capitalize"
              >Provincia</label
            >
            <input
              v-model="province"
              type="text"
              class="form-control"
              id="province"
              placeholder="Tu provincia"
              required
            />
          </div>
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input border-dark"
              id="condiciones"
              v-model="termsAccepted"
              required
            />
            <label class="form-check-label fw-light" for="condiciones"
              ><small
                >He leído y acepto la Política de Privacidad y condiciones de
                uso</small
              ></label
            >
          </div>
          <button type="submit" class="btn btn-primary w-100 mt-4">
            Registrarme
          </button>
        </form>
        <p class="text-center">
          <small class="text-muted">O hacerlo con </small>
        </p>
        <div class="text-center">
          <button class="btn btn-light border-dark-subtle">
            <AtomsIconsGoogleIcon />
          </button>
          <button class="btn btn-light border-dark-subtle mx-4">
            <AtomsIconsAppleIcon />
          </button>
        </div>
      </div>

      <!-- register with id card-->
      <div v-if="signupOption == 'idCard'">
        <div>
          <form @submit.prevent="registerWithIdCard">
            <div v-if="breadcrumOption == 'idCard'">
              <div class="card">
                <div class="card-body">
                  <div class="form-group mb-3">
                    <label for="idType" class="form-label"
                      >Tipo de identificación</label
                    >
                    <select
                      v-model="idType"
                      class="form-control"
                      id="idType"
                      required
                    >
                      <option value="PHYSICAL_DNI">Cédula Física</option>
                      <option value="LEGAL_DNI">Cédula Jurídica</option>
                      <option value="PASSPORT">Pasaporte</option>
                      <option value="RESIDENCE_CARD">
                        Carné de Residencia
                      </option>
                    </select>
                  </div>
                  <div class="input-group mb-3">
                    <span class="input-group-text">Nº de Cédula</span>
                    <input
                      v-model="cardId"
                      type="text"
                      class="form-control"
                      placeholder="Ej: 117456623"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- personal info -->
            <div v-if="breadcrumOption == 'personalInfo'">
              <div class="card">
                <div class="card-body">
                  <div class="input-group mb-3">
                    <span class="input-group-text">Nombre completo</span>
                    <input
                      v-model="name"
                      type="text"
                      class="form-control"
                      placeholder="Martin Gonzalez"
                      required
                    />
                  </div>

                  <div class="input-group mb-3">
                    <span class="input-group-text">Correo electrónico</span>
                    <input
                      v-model="email"
                      type="email"
                      class="form-control"
                      placeholder="ejemplo@correo.com"
                      required
                    />
                  </div>

                  <div class="input-group mb-3">
                    <span class="input-group-text">Número de teléfono</span>
                    <input
                      v-model="phoneNumber"
                      type="tel"
                      class="form-control"
                      placeholder="87273307"
                      required
                    />
                  </div>

                  <div class="input-group mb-3">
                    <span class="input-group-text">Género</span>
                    <select v-model="gender" class="form-control" required>
                      <option value="">Seleccione un género</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>

                  <div class="input-group mb-3">
                    <span class="input-group-text">País</span>
                    <input
                      v-model="countryIsoCode"
                      type="text"
                      class="form-control"
                      placeholder="CRC"
                      required
                    />
                  </div>

                  <div class="input-group mb-3">
                    <span class="input-group-text">Provincia</span>
                    <input
                      v-model="province"
                      type="text"
                      class="form-control"
                      placeholder="San José"
                      required
                    />
                  </div>

                  <div class="input-group mb-3">
                    <span class="input-group-text">Dirección</span>
                    <input
                      v-model="address"
                      type="text"
                      class="form-control"
                      placeholder="Calle Verde 12, San José, Costa Rica"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- create account -->
            <div v-if="breadcrumOption == 'create'">
              <div class="card">
                <div class="card-body">
                  <div class="input-group mb-3">
                    <span class="input-group-text">Contraseña</span>
                    <input
                      v-model="password"
                      type="password"
                      class="form-control"
                      placeholder="Crea una contraseña segura"
                      required
                    />
                  </div>

                  <div class="input-group mb-3">
                    <span class="input-group-text">Confirmar Contraseña</span>
                    <input
                      v-model="confirmPassword"
                      type="password"
                      class="form-control"
                      placeholder="Repite tu contraseña"
                      required
                    />
                  </div>

                  <div class="form-check mb-3">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id="terms"
                      v-model="termsAccepted"
                      required
                    />
                    <label class="form-check-label" for="terms">
                      Acepto los términos y condiciones
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- navigation buttons -->
        <div class="d-flex justify-content-end">
          <div style="margin-right: 5px">
            <button
              type="button"
              class="btn btn-secondary mt-4"
              @click="
                setNavigationIdCardSeccion({
                  current: breadcrumOption,
                  action: 'back',
                })
              "
            >
              Atrás
            </button>
          </div>

          <div>
            <button
              v-if="breadcrumOption !== 'create'"
              type="button"
              class="btn btn-primary mt-4"
              @click="
                setNavigationIdCardSeccion({
                  current: breadcrumOption,
                  action: 'next',
                })
              "
            >
              Continuar
            </button>
            <button
              v-else
              type="submit"
              class="btn btn-primary mt-4"
              @click="registerWithIdCard"
            >
              Registrarme
            </button>
          </div>
        </div>
      </div>

      <div class="text-center py-3">
        Ya tienes una cuenta?
        <NuxtLink class="btn-link" href="/pacientes/login"
          >Iniciar sesión</NuxtLink
        >
      </div>
    </section>
  </NuxtLayout>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth-login"],
});

type BreadcrumbIdCardOptions =
  | "registerType"
  | "idCard"
  | "personalInfo"
  | "create";
type BreadcrumbEmailOptions = "registerType" | "create";

const config = useRuntimeConfig();
const router = useRouter();

// Common fields
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const phoneNumber = ref("");
const gender = ref("");
const countryIsoCode = ref("CRC"); // Default to Costa Rica
const province = ref("");
const termsAccepted = ref(false);

// ID Card specific fields
const cardId = ref("");
const idType = ref("PHYSICAL_DNI");
const address = ref("");

// Form state
const signupOption = ref<"email" | "idCard" | null>(null);
const selectedOption = ref<"email" | "idCard">("email");
const breadcrumOption = ref<BreadcrumbIdCardOptions>("registerType");

const register = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Las contraseñas no coinciden");
    return;
  }

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          name: name.value,
          email: email.value,
          card_id: cardId.value,
          password: password.value,
          gender: gender.value,
          role_code: "CUSTOMER",
          phone_number: phoneNumber.value,
          country_iso_code: countryIsoCode.value,
          province: province.value,
          profile_picture_url: "",
          code_contract: "",
          finance_entity: "8401b1be-7e1d-4357-a632-15172a647b8d",
        },
      }
    );

    if (data.value) {
      router.push("/pacientes/inicio");
    }

    if (error.value) {
      console.error("Registration error:", error.value);
      alert("Error en el registro: " + error.value.message);
    }
  } catch (err) {
    console.error("Registration failed:", err);
    alert("Error en el registro");
  }
};

const registerWithIdCard = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Las contraseñas no coinciden");
    return;
  }

  if (!termsAccepted.value) {
    alert("Debes aceptar los términos y condiciones");
    return;
  }

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/auth/register",
      {
        method: "POST",
        headers: {
          "x-api-key": config.public.API_KEY,
          "Content-Type": "application/json",
        },
        body: {
          card_id: cardId.value,
          id_type: idType.value,
          name: name.value,
          email: email.value,
          password: password.value,
          gender: gender.value,
          role_code: "CUSTOMER",
          phone_number: phoneNumber.value,
          country_iso_code: countryIsoCode.value,
          province: province.value,
          address: address.value,
          profile_picture_url: "",
          finance_entity: "8401b1be-7e1d-4357-a632-15172a647b8d",
          code_contract: "",
        },
      }
    );

    if (data.value) {
      router.push("/pacientes/inicio");
    }

    if (error.value) {
      console.error("Registration error:", error.value);
      alert("Error en el registro: " + error.value.message);
    }
  } catch (err) {
    console.error("Registration failed:", err);
    alert("Error en el registro");
  }
};

function setNavigationIdCardSeccion(params: {
  current: BreadcrumbIdCardOptions;
  action: "back" | "next";
}) {
  const { current, action } = params;
  if (action == "back") {
    if (current == "create") breadcrumOption.value = "personalInfo";
    if (current == "personalInfo") breadcrumOption.value = "idCard";
    if (current == "idCard") {
      breadcrumOption.value = "registerType";
      signupOption.value = null;
    }
  }
  if (action == "next") {
    if (current == "registerType") breadcrumOption.value = "idCard";
    if (current == "idCard") breadcrumOption.value = "personalInfo";
    if (current == "personalInfo") breadcrumOption.value = "create";
  }
}

function setNavigationEmailSeccion(params: {
  current: BreadcrumbEmailOptions;
  action: "back" | "next";
}) {
  const { current, action } = params;
  if (action == "back") {
    if (current == "create") {
      breadcrumOption.value = "registerType";
      signupOption.value = null;
    }
  }
  if (action == "next") {
    if (current == "registerType") breadcrumOption.value = "create";
  }
}
</script>

<style scoped>
.breadcrumb-selected {
  color: #3541b4;
}
</style>
