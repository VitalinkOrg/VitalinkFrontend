<template>
  <WebsiteNav />
  <main class="d-flex" style="background-color: #f8f8f8">
    <section class="left text-center d-sm-flex d-none">
      <!-- <NuxtLink class="logo" href="/"><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink Logo"></NuxtLink> -->
      <!-- <img src="@/src/assets/img-login.png" alt=""> -->
      <div>
        <h1 class="text-primary">
          Únete a la Comunidad<br />Médica de Vitalink
        </h1>
        <p class="fs-5 fw-light text-muted mx-auto my-4">
          Selecciona tu Rol Médico y Comienza a Conectar con Pacientes
        </p>
        <div class="d-flex justify-content-center">
          <span class="btn-custom btn-custom-active rounded-4">
            <span class="btn-custom-check"></span>
            <span class="btn-custom-text btn-custom-active-text fw-semibold"
              >Médico</span
            >
          </span>
          <NuxtLink
            href="/clinicas/registro"
            class="btn-custom btn-custom-inactive rounded-4"
          >
            <span class="btn-custom-check"></span>
            <span class="btn-custom-text btn-custom-inactive-text fw-semibold"
              >Hospital</span
            >
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="right bg-light">
      <div class="d-flex align-items-center justify-content-between">
        <h2 class="h1 fw-bold fs-2 text-primary m-0">Registrarse</h2>
        <span class="text-primary">Es gratis y fácil</span>
      </div>
      <div class="fw-semibold my-4">
        <span class="text-success me-5">Datos Personales</span>
        <span :class="tab === 2 ? 'text-success' : 'text-muted'"
          >Información Profesional</span
        >
      </div>
      <form @submit.prevent="register">
        <!-- TAB DATOS PERSONALES -->
        <div v-if="tab === 1">
          <label class="form-label mb-4 text-dark text-capitalize"
            >Completa los datos de registro</label
          >
          <div class="row row-cols-2">
            <div class="form-group mb-4">
              <label for="nombre" class="form-label text-capitalize"
                >Nombre</label
              >
              <input
                v-model="first_name"
                type="text"
                class="form-control"
                placeholder="Escribe tu nombre"
                id="nombre"
                required
              />
              <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
            </div>
            <div class="form-group mb-4">
              <label for="apellido" class="form-label text-capitalize"
                >Apellido</label
              >
              <input
                v-model="last_name"
                type="text"
                class="form-control"
                placeholder="Escribe tu apellido"
                id="apellido"
                required
              />
              <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
            </div>
            <div class="form-group mb-4">
              <label for="telefono" class="form-label text-capitalize"
                >Número de teléfono</label
              >
              <input
                v-model="phone_number"
                type="phone"
                class="form-control"
                placeholder="0000-0000"
                id="telefono"
                required
              />
              <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
            </div>
            <div class="form-group mb-4">
              <label for="dob" class="form-label text-capitalize"
                >Fecha de nacimiento</label
              >
              <input
                v-model="date_birth"
                type="date"
                class="form-control"
                placeholder="15/06/1996"
                id="dob"
                required
              />
              <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
            </div>
          </div>
          <hr />
          <div class="form-group mb-4">
            <label for="email" class="form-label text-capitalize"
              >Correo Electrónico</label
            >
            <input
              v-model="email"
              type="email"
              class="form-control"
              placeholder="Escribe tu correo electrónico"
              id="email"
              required
            />
            <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
          </div>
          <div class="row row-cols-2">
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
              <!-- <div id="passwordHelp" class="form-text">Deben ser 8 caracteres como mínimo</div> -->
            </div>
            <div class="form-group mb-4">
              <label for="confirmPassword" class="form-label text-capitalize"
                >Confirmar Contraseña</label
              >
              <input
                v-model="passwordConfirmation"
                type="password"
                class="form-control"
                id="confirmPassword"
                placeholder="Escribe tu contraseña"
                aria-describedby="confirmPasswordHelp"
                name="confirmPassword"
                required
              />
              <!-- <div id="passwordHelp" class="form-text">Deben ser 8 caracteres como mínimo</div> -->
            </div>
          </div>
          <div v-if="errorPassword">
            <p>{{ errorPassword }}</p>
          </div>

          <button @click="nextStep" class="btn btn-primary">
            Siguiente Paso
            <AtomsIconsArrowRightIcon />
          </button>
        </div>
        <div v-if="tab === 2">
          <label class="form-label mb-4 text-dark text-capitalize"
            >Completa la información básica profesional</label
          >

          <div class="form-group mb-4">
            <label for="matricula" class="form-label text-capitalize"
              >Nº de Matricula</label
            >
            <input
              v-model="medical_number"
              type="text"
              class="form-control"
              placeholder="Escribe tu número de matricula"
              id="matricula"
              required
            />
          </div>
          <div class="form-group mb-4">
            <label for="servicios" class="form-label text-capitalize"
              >Servicios que ofrecen</label
            >
            <select
              id="servicios"
              class="form-select"
              multiple
              size="6"
              v-model="specialtiesSelected"
            >
              <option
                v-for="specialty in specialties"
                :key="specialty.id"
                :value="specialty.code"
              >
                {{ specialty.name }}
              </option>
            </select>
          </div>
          <div class="mb-3 form-check">
            <input
              type="checkbox"
              class="form-check-input border-dark"
              id="recordarme"
            />
            <label class="form-check-label border" for="recordarme"
              >Recordarme</label
            >
          </div>
          <div class="mb-3 form-check">
            <input
              type="checkbox"
              class="form-check-input border-dark"
              id="politicas"
            />
            <label class="form-check-label" for="politicas"
              >He leído y acepto la Política de Privacidad y condiciones de
              uso</label
            >
          </div>
          <button @click="tab = 1" class="btn btn-light border-dark w-100">
            <AtomsIconsArrowLeftIcon />
            Volver Atrás
          </button>
          <button type="submit" class="btn btn-primary w-100 mt-2">
            Registrarme
          </button>
        </div>
        <div class="modal-footer justify-content-center" v-if="errorText">
          <p>{{ errorText }}</p>
        </div>
      </form>
      <hr />
      <p class="text-center">
        <small class="text-muted">O hacerlo con estas cuentas</small>
      </p>
      <div class="text-center">
        <button class="btn btn-light border-dark-subtle">
          <AtomsIconsGoogleIcon />
        </button>
        <button class="btn btn-light border-dark-subtle mx-4">
          <AtomsIconsAppleIcon />
        </button>
        <button class="btn btn-light border-dark-subtle">
          <AtomsIconsFacebookIcon />
        </button>
      </div>
      <p class="text-center mt-3">
        <span class="text-muted">Ya tienes Cuenta? </span>
        <NuxtLink href="/pacientes/login" class="btn-link text-dark fw-medium"
          >Iniciar Sesión</NuxtLink
        >
      </p>
    </section>
  </main>
</template>

<script setup>
definePageMeta({
  middleware: ["auth-login"],
});
const config = useRuntimeConfig();
const router = useRouter();
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const first_name = ref("");
const last_name = ref("");
const phone_number = ref("");
const date_birth = ref("");
const medical_number = ref("");
const specialtiesSelected = ref([]);
const tab = ref(1);
const errorPassword = ref("");
const errorText = ref(null);

const { data: specialties } = await useFetch(
  "https://stg.vitalink.cr" + "/specialties",
  {
    transform: (_specialties) => _specialties.data,
  },
);

const nextStep = () => {
  const { value: firstNameValue } = first_name;
  const { value: lastNameValue } = last_name;
  const { value: phoneNumberValue } = phone_number;
  const { value: dateOfBirthValue } = date_birth;
  const { value: emailValue } = email;
  const { value: passwordValue } = password;
  const { value: passwordConfirmationValue } = passwordConfirmation;

  if (
    firstNameValue &&
    lastNameValue &&
    phoneNumberValue &&
    dateOfBirthValue &&
    emailValue &&
    passwordValue &&
    passwordConfirmationValue
  ) {
    if (passwordValue === passwordConfirmationValue) {
      tab.value = 2;
    } else {
      errorPassword.value = "Passwords do not match";
    }
  }
};

const register = async () => {
  const { data, error } = await useFetch(
    "https://stg.vitalink.cr" + "/users/register_doctor",
    {
      method: "POST",
      body: {
        password,
        email,
        first_name,
        last_name,
        phone_number,
        date_birth,
        medical_number,
        specialties: specialtiesSelected,
      },
    },
  );
  if (data.value) {
    router.push("/");
  }
  if (error.value) {
    console.log(error.value, "data");
    errorText.value = error.value.data.info;
  }
};
</script>

<style src="@/assets/styles/vitalink.scss" />

<style lang="scss" scoped>
main {
  height: 100vh;
}

.left,
.right {
  width: 100%;
  height: 100%;
}

.left {
  background-color: #ebecf7;
  background-image: url("@/src/assets/bg-login-medicos-clinicas.svg");
  background-size: 100% auto;
  background-position: center center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 1rem;
  background-repeat: no-repeat;
}

.right {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  // align-items: center;
  overflow-y: auto;
}

.btn-custom {
  height: 10rem;
  width: 10rem;
  display: flex;
  margin: 1rem;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  text-decoration: none;
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: center 1.5rem;

  &-active {
    background-color: #3541b4;
    box-shadow:
      13px 9px 51.3px 0px rgba(0, 0, 0, 0.15),
      0 0 0 9px #c2ebee;
    background-image: url("@/src/assets/img-icon-medico-active.svg");

    &-text {
      background: linear-gradient(0deg, #0cadbb 35.25%, #c2ebee 149.99%);
      color: white;
    }
  }

  &-inactive {
    background-color: white;
    background-image: url("@/src/assets/img-icon-clinica-inactive.svg");

    &-text {
      background-color: #e7f7f8;
      color: #85d6dd;
    }
  }

  &-text {
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    border-radius: 0.7rem;
  }
}
</style>
