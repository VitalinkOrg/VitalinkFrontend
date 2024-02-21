<template>
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
          <NuxtLink
            href="/medicos/registro"
            class="btn-custom btn-custom-inactive rounded-4"
          >
            <span class="btn-custom-check"></span>
            <span class="btn-custom-text btn-custom-inactive-text fw-semibold"
              >Médico</span
            >
          </NuxtLink>
          <span class="btn-custom btn-custom-active rounded-4">
            <span class="btn-custom-check"></span>
            <span class="btn-custom-text btn-custom-active-text fw-semibold"
              >Hospital</span
            >
          </span>
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
          >Información General</span
        >
      </div>
      <form @submit.prevent="register">
        <!-- TAB DATOS PERSONALES -->
        <div v-if="tab === 1">
          <label class="form-label mb-4 text-dark text-capitalize"
            >Completa los datos de registro</label
          >
          <div class="form-group mb-4">
            <label for="nombre" class="form-label text-capitalize"
              >Nombre del Hospital/Clinica</label
            >
            <input
              v-model="name"
              type="text"
              class="form-control"
              placeholder="Escribe el nombre del hospital"
              id="nombre"
              required
            />
            <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
          </div>
          <div class="row row-cols-2">
            <div class="form-group mb-4">
              <label for="telefono" class="form-label text-capitalize"
                >Número de teléfono</label
              >
              <input
                v-model="phone_number_1"
                type="phone"
                class="form-control"
                placeholder="0000-0000"
                id="telefono"
                required
              />
              <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
            </div>
            <div class="form-group mb-4">
              <label for="direccion" class="form-label text-capitalize"
                >Dirección</label
              >
              <input
                v-model="address"
                type="text"
                class="form-control"
                placeholder="Escribe la dirección"
                id="direccion"
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
                type="password"
                class="form-control"
                id="confirmPassword"
                placeholder="Escribe tu contraseña"
                aria-describedby="confirmPasswordHelp"
                name="confirmPassword"
              />
              <!-- <div id="passwordHelp" class="form-text">Deben ser 8 caracteres como mínimo</div> -->
            </div>
          </div>

          <button @click="tab = 2" class="btn btn-primary">
            Siguiente Paso
            <AtomsIconsArrowRightIcon />
          </button>
        </div>
        <div v-if="tab === 2">
          <label class="form-label mb-4 text-dark text-capitalize"
            >Completa la información básica profesional</label
          >

          <div class="form-group mb-4">
            <label for="matricula-medica" class="form-label text-capitalize"
              >No de Matricula Médica</label
            >
            <input
              v-model="medical_number"
              type="text"
              class="form-control"
              placeholder="Escribe el número de Matricula Médica"
              id="matricula-medica"
              required
            />
            <!-- <div id="matriculaHelp" class="form-text">We'll never share your email with anyone else.</div> -->
          </div>
          <div class="form-group mb-4">
            <label for="nombre-central" class="form-label text-capitalize"
              >Nombre del Hospital Central</label
            >
            <input
              v-model="legal_name"
              type="text"
              class="form-control"
              placeholder="Escribe el Nombre del Hospital central"
              id="nombre-central"
            />
            <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
          </div>
          <div class="form-group mb-4">
            <label for="especialidades" class="form-label text-capitalize"
              >Especialidades Médicas</label
            >
            <select
              id="especialidades"
              v-model="specialties"
              class="form-select"
            >
              <option disabled selected>Oftalmología</option>
              <option value="oftalmologia">Oftalmología</option>
            </select>
            <div>
              <span
                class="badge rounded-circle bg-primary text-primary me-2"
                style="--bs-bg-opacity: 0.05"
                >Oftalmología x</span
              >
            </div>
          </div>
          <div class="form-group mb-4">
            <label for="servicios" class="form-label text-capitalize"
              >Servicios que se practican</label
            >
            <select v-model="services" id="servicios" class="form-select">
              <option disabled selected>Cirugía</option>
              <option value="oftalmologia">Cirugía</option>
            </select>
            <div>
              <span
                class="badge rounded-circle bg-primary text-primary me-2"
                style="--bs-bg-opacity: 0.05"
                >Cirugía x</span
              >
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
        <NuxtLink href="/clinicas/registro" class="btn-link text-dark fw-medium"
          >Iniciar Sesión</NuxtLink
        >
      </p>
    </section>
  </main>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
const router = useRouter();
const email = ref("");
const password = ref("");
const name = ref("");
const address = ref("");
const legal_name = ref("");
const phone_number_1 = ref("");
const medical_number = ref("");
const services = ref([]);
const specialties = ref([""]);
const tab = ref(1);

const register = async () => {
  const { data, error }: any = await useFetch(
    config.public.API_BASE_URL + "/users/register_doctor",
    {
      method: "POST",
      body: {
        password,
		email,
		name,
		phone_number_1,
		medical_number,
		services,
    specialties,
    address,
    legal_name,
      },
    }
  );
  if (data.value) {
    router.push("/");
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};
</script>

<style src="@/assets/styles/vitalink.scss" />

<style lang="scss" scoped>
main {
  height: 100vh;
}

.logo {
  img {
    width: 10rem;
  }
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
    box-shadow: 13px 9px 51.3px 0px rgba(0, 0, 0, 0.15), 0 0 0 9px #c2ebee;
    background-image: url("@/src/assets/img-icon-clinica-active.svg");

    &-text {
      background: linear-gradient(0deg, #0cadbb 35.25%, #c2ebee 149.99%);
      color: white;
    }
  }

  &-inactive {
    background-color: white;
    background-image: url("@/src/assets/img-icon-medico-inactive.svg");

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

  &-check {
  }
}
</style>
