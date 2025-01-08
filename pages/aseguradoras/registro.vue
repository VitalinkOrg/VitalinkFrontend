<template>
  <NuxtLayout name="web">
    <div class="header d-grid">
      <div class="container my-5">
        <div class="row my-3">
          <div class="col">
            <h1 class="display-5 text-center">
              Maximiza tu Presencia Médica Online
            </h1>
            <p class="text-center text-muted mb-0 lead">
              Registrate ahora para gestionar tu actividad y la de tus
              asegurados dentro de Vitalink.
            </p>
            <img
              src="@/src/assets/img-login-aseguradoras.png"
              class="img-fluid"
              alt=""
            />
          </div>
          <div class="col">
            <div class="card p-5">
              <form @submit.prevent="register">
                <div>
                  <h5 class="mt-0">Crear cuenta</h5>
                  <label class="form-label mb-0 text-dark text-capitalize"
                    >Datos del usuario</label
                  >
                  <hr class="my-1" />
                  <div class="row row-cols-2 my-3">
                    <div class="form-group mb-2">
                      <label for="nombre" class="form-label text-capitalize"
                        >Nombre</label
                      >
                      <input
                        v-model="name"
                        type="text"
                        class="form-control"
                        placeholder="Escribe tu nombre"
                        id="nombre"
                        required
                      />
                      <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                    </div>
                    <div class="form-group mb-2">
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
                    <div class="form-group mb-2">
                      <label for="dob" class="form-label text-capitalize"
                        >Fecha de nacimiento</label
                      >
                      <input
                        v-model="birthdate"
                        type="date"
                        class="form-control"
                        placeholder="15/06/1996"
                        id="dob"
                        required
                      />
                      <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                    </div>
                    <div class="form-group mb-2">
                      <label for="dob" class="form-label text-capitalize"
                        >Dirección</label
                      >
                      <input
                        v-model="address"
                        type="text"
                        class="form-control"
                        placeholder="Dirección"
                        id="dob"
                        required
                      />
                      <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                    </div>
                  </div>
                  <div class="row row-cols-3">
                    <div class="form-group mb-2">
                      <label for="apellido" class="form-label text-capitalize"
                        >Código Postal</label
                      >
                      <input
                        v-model="postal_code"
                        type="number"
                        class="form-control"
                        placeholder="000000"
                        id="apellido"
                        required
                      />
                      <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                    </div>
                    <div class="form-group mb-2">
                      <label for="apellido" class="form-label text-capitalize"
                        >Ciudad</label
                      >
                      <input
                        v-model="city"
                        type="text"
                        class="form-control"
                        placeholder="Ciudad"
                        id="apellido"
                        required
                      />
                      <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                    </div>
                    <div class="form-group mb-2">
                      <label for="apellido" class="form-label text-capitalize"
                        >País</label
                      >
                      <input
                        v-model="country"
                        type="text"
                        class="form-control"
                        placeholder="País"
                        id="apellido"
                        required
                      />
                      <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                    </div>
                  </div>
                  <label class="form-label mb-0 text-dark text-capitalize"
                    >Datos del usuario</label
                  >
                  <hr class="my-1" />
                  <div class="form-group my-3">
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
                    <div class="form-group mb-2">
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
                    <div class="form-group mb-2">
                      <label
                        for="confirmPassword"
                        class="form-label text-capitalize"
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

                  <button type="submit" class="btn btn-primary w-100">
                    Crear
                  </button>
                  <hr />
                  <p class="text-center mt-3 mb-0">
                    <span class="text-muted">Ya tienes Cuenta? </span>
                    <NuxtLink
                      href="/pacientes/login"
                      class="btn-link text-dark fw-medium"
                      >Iniciar Sesión</NuxtLink
                    >
                  </p>
                </div>
                <div
                  class="modal-footer justify-content-center"
                  v-if="errorText"
                >
                  <p>{{ errorText }}</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
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
const name = ref("");
const phone_number = ref("");
const birthdate = ref("");
const address = ref("");
const postal_code = ref("");
const city = ref("");
const country = ref("");
const errorPassword = ref("");
const errorText = ref(null);

const register = async () => {
  const { value: nameValue } = name;
  const { value: phoneNumberValue } = phone_number;
  const { value: dateOfBirthValue } = birthdate;
  const { value: emailValue } = email;
  const { value: passwordValue } = password;
  const { value: passwordConfirmationValue } = passwordConfirmation;
  const { value: addressValue } = address;
  const { value: cityValue } = city;
  const { value: postalCodeValue } = postal_code;
  const { value: countryValue } = country;

  if (
    nameValue &&
    phoneNumberValue &&
    dateOfBirthValue &&
    emailValue &&
    passwordValue &&
    passwordConfirmationValue &&
    addressValue &&
    cityValue &&
    postalCodeValue &&
    countryValue
  ) {
    if (passwordValue !== passwordConfirmationValue) {
      return (errorPassword.value = "Passwords do not match");
    }
  }

  const { data, error } = await useFetch(
    "https://stg.vitalink.cr" + "/users/register_insurance",
    {
      method: "POST",
      body: {
        password,
        email,
        name,
        phone_number,
        birthdate,
        address,
        city,
        country,
        postal_code,
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

<style scoped lang="scss">
.header {
  min-height: 100vh;
  background-color: #e2e4fa;
}

.card {
  border-radius: 25px;
  background: var(--Gray-Scale-White, #fff);
  box-shadow: 0px 0px 35.8px 0px rgba(0, 0, 0, 0.1);
}
</style>
