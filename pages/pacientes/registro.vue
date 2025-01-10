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
            <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
          </div>
          <div class="form-group mb-4">
            <label for="email" class="form-label text-capitalize"
              >Tu correo electrónico o número de teléfono</label
            >
            <input
              v-model="email"
              type="email"
              class="form-control"
              id="email"
              aria-describedby="emailHelp"
              placeholder="Tu correo electrónico o número de teléfono"
              required
            />
            <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
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
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input border-dark"
              id="recordarme"
            />
            <label class="form-check-label fw-light" for="recordarme"
              ><small>Recordarme</small></label
            >
          </div>
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input border-dark"
              id="condiciones"
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
          <form @submit.prevent="register">
            <div v-if="breadcrumOption == 'idCard'">
              <div class="card">
                <div class="card-body">
                  <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon1"
                      >Nº de Cédula</span
                    >
                    <input
                      type="text"
                      class="form-control"
                      placeholder="AGSHUKHMBVJF"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- name -->
            <div v-if="breadcrumOption == 'personalInfo'">
              <div class="card">
                <div class="card-body">
                  <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon1"
                      >Nombre</span
                    >
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Martin Gonzalez"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
                  </div>

                  <!-- company -->
                  <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon1"
                      >Empresa a la que pertenece</span
                    >
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Google"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
                  </div>

                  <!-- address -->
                  <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon1"
                      >Dirección</span
                    >
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Calle Verde 12, San José, Costa Rica"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div v-if="breadcrumOption == 'create'">
              <div class="card">
                <div class="card-body">
                  <!-- password -->
                  <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon1"
                      >Contraseña</span
                    >
                    <input
                      type="text"
                      class="form-control"
                      placeholder="123"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
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
              type="submit"
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
              type="submit"
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
const name = ref("");
const email = ref("");
const password = ref("");
const signupOption = ref<"email" | "idCard" | null>(null);
const selectedOption = ref<"email" | "idCard">("email");
const breadcrumOption = ref<BreadcrumbIdCardOptions>("registerType");

const register = async () => {
  const { data, error }: any = await useFetch(
    config.public.API_BASE_URL + "/users/register_patient",
    {
      method: "POST",
      body: {
        name,
        email,
        password,
      },
    },
  );
  if (data.value) {
    router.push("/");
  }
  if (error.value) {
    console.log(error.value, "data");
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
    console.log(params);
    if (current == "registerType") breadcrumOption.value = "create";
  }
}
</script>

<style scoped>
.breadcrumb-selected {
  color: #3541b4;
}
</style>
