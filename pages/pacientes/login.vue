<template>
  <NuxtLayout name="pacientes-login">
    <h1 class="fw-semibold fs-2">Ingrese a su cuenta</h1>
    <hr />
    <form @submit.prevent="login">
      <div class="form-group mb-4">
        <label for="email" class="form-label text-capitalize">Correo Electrónico</label>
        <input v-model="user.email" type="email" class="form-control" placeholder="Escribe tu correo electrónico"
          name="email" required />
        <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
      </div>
      <div class="form-group mb-4">
        <label for="password" class="form-label text-capitalize">Contraseña</label>
        <input v-model="user.password" type="password" class="form-control" id="password"
          placeholder="Escribe tu contraseña" aria-describedby="passwordHelp" required name="password" />
        <!-- <div id="passwordHelp" class="form-text">Deben ser 8 caracteres como mínimo</div> -->
      </div>
      <button type="submit" class="btn btn-primary w-100 mt-4">Ingresar</button>
    </form>
    <hr />
    <p class="text-center"><small class="text-muted">O Ingresa Con</small></p>
    <div class="text-center d-flex flex-column">
      <button class="btn btn-light border-dark-subtle mb-3">
        Ingresar con Facebook
      </button>
      <button class="btn btn-light border-dark-subtle mb-3">
        Ingresar con Google
      </button>
    </div>
    <p class="text-center">
      <span class="text-muted">No tienes Cuenta? </span>
      <NuxtLink href="/pacientes/registro" class="btn-link text-dark fw-medium">Registrate</NuxtLink>
    </p>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useAuthStore } from '~/store/auth'; // import the auth store we just created

const { authenticateUser } = useAuthStore(); // use authenticateUser action from  auth store

const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs

const user = ref({
  email: 'test@gmail.com',
  password: 'test',
});
const router = useRouter();

const login = async () => {
  await authenticateUser(user.value); // call authenticateUser and pass the user object
  // redirect to homepage if user is authenticated
  if (authenticated) {
    router.push('/');
  }
};
</script>

<style lang="scss" scoped>
main {
  height: 100vh;
}

.logo {
  width: 35%;
}

.left,
.right {
  width: 100%;
  height: 100%;
}

.left {
  background-color: #ebecf7;
  background-image: url("@/src/assets/bg-login.svg");
  background-size: cover;
  background-position: center center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 1rem;
}

.right {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}
</style>
