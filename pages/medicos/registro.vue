<template>
  <WebsiteNav />
  <main class="d-flex" style="background-color: #f8f8f8">
    <section class="left text-center d-sm-flex d-none">
      <NuxtLink class="logo" href="/"
        ><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink Logo"
      /></NuxtLink>
      <img src="@/src/assets/img-doctor-login.png" alt="" />
      <p class="fs-5 w-50 fw-normal text-muted">
        ¡Comienza tu viaje hacia un mejor cuidado de la salud hoy mismo!
      </p>
    </section>

    <section class="right bg-light">
      <div class="d-flex align-items-center justify-content-between">
        <h2 class="h1 fw-bold fs-2 text-primary m-0">Registrarse</h2>
        <span class="text-primary">Es gratis y fácil</span>
      </div>
      <div class="fw-semibold my-4 d-flex">
        <WebsiteStepper :steps="steps" :currentStep="tab" />
      </div>
      <form @submit.prevent="register">
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
              placeholder="Escribe el nº de Matrícula Médica"
              id="matricula"
              required
            />
          </div>
          <div class="form-group mb-4">
            <label for="hospital" class="form-label text-capitalize"
              >Nombre del Hospital Central</label
            >
            <input
              v-model="hospital_name"
              type="text"
              class="form-control"
              placeholder="Escribe el Nombre del Hospital Central"
              id="hospital"
              required
            />
          </div>
          <div class="form-group mb-4">
            <label for="specialties" class="form-label text-capitalize"
              >Especialidades Médicas</label
            >
            <select
              id="specialties"
              class="form-select"
              v-model="selectedSpecialty"
            >
              <option value="" disabled>Seleccione una especialidad</option>
              <option
                v-for="specialty in specialties"
                :key="specialty"
                :value="specialty"
              >
                {{ specialty.name }}
              </option>
            </select>
            <div class="mt-2" v-if="specialtiesSelected.length > 0">
              <span
                v-for="specialtyCode in specialtiesSelected"
                :key="specialtyCode"
                class="badge bg-primary-subtle text-primary me-1 rounded-5"
              >
                {{ specialtyCode.name }}
                <button
                  type="button"
                  class="btn-close btn-close-primary ms-1"
                  aria-label="Remove"
                  @click="removeSpecialty(specialtyCode)"
                ></button>
              </span>
            </div>
          </div>
          <div class="form-group mb-4">
            <label for="services" class="form-label text-capitalize"
              >Servicios que se practican</label
            >
            <select v-model="selectedService" class="form-select">
              <option value="" disabled>Seleccione un servicio</option>
              <option
                v-for="service in availableServices"
                :key="service"
                :value="service"
              >
                {{ service.name }}
              </option>
            </select>
            <div class="mt-2" v-if="selectedServices.length > 0">
              <span
                v-for="service in selectedServices"
                :key="service"
                class="badge bg-primary-subtle text-primary me-1 rounded-5"
              >
                {{ service.name }}
                <button
                  type="button"
                  class="btn-close btn-close-primary ms-1"
                  aria-label="Close"
                  @click="removeService(service)"
                ></button>
              </span>
            </div>
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
const hospital_name = ref("");
const selectedSpecialty = ref("");
const specialtiesSelected = ref([]);
const tab = ref(1);
const errorPassword = ref("");
const errorText = ref(null);

const specialties = ref([
  { id: 1, code: "ophthalmology", name: "Oftalmología" },
  { id: 2, code: "cardiology", name: "Cardiología" },
  { id: 3, code: "dermatology", name: "Dermatología" },
  // Add more specialties as needed
]);

// Mock Services API Response
const availableServices = ref([
  { id: 1, code: "surgery", name: "Cirugía" },
  { id: 2, code: "consultation", name: "Consulta" },
  { id: 3, code: "tests", name: "Pruebas Diagnósticas" },
  // Add more services as needed
]);

const selectedService = ref("");
const selectedServices = ref([]);

watch(selectedService, (newService) => {
  if (newService && !selectedServices.value.includes(newService)) {
    selectedServices.value.push(newService);
    selectedService.value = ""; // Reset the dropdown
  }
});

watch(selectedSpecialty, (newSpecialty) => {
  console.log(selectedSpecialty);
  if (newSpecialty && !specialtiesSelected.value.includes(newSpecialty)) {
    specialtiesSelected.value.push(newSpecialty);
    selectedSpecialty.value = ""; // Reset selection
  }
});

const removeService = (serviceToRemove) => {
  selectedServices.value = selectedServices.value.filter(
    (service) => service !== serviceToRemove
  );
};

const removeSpecialty = (specialtyToRemove) => {
  specialtiesSelected.value = specialtiesSelected.value.filter(
    (specialty) => specialty !== specialtyToRemove
  );
};

const steps = ["Datos Personales", "Información Profesional"];

/*const { data: specialties } = await useFetch(
  config.public.API_BASE_URL + "/specialties",
  {
    transform: (_specialties) => _specialties.data,
  }
);*/

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
    config.public.API_BASE_URL + "/users/register_doctor",
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
    }
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
  background-image: url("@/src/assets/bg-login.svg");
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
