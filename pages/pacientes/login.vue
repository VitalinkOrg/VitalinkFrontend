<template>
  <NuxtLayout name="login">
    <h1 class="fw-semibold fs-2">Ingrese a su cuenta</h1>
    <hr>
    <form>
      <div class="form-group mb-4">
        <label for="email" class="form-label text-capitalize">Correo Electrónico</label>
        <input type="email" class="form-control" id="email" aria-describedby="emailHelp"
          placeholder="Escribe tu correo electrónico">
        <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
      </div>
      <div class="form-group mb-4">
        <label for="password" class="form-label text-capitalize">Contraseña</label>
        <input type="password" class="form-control" id="password" placeholder="Escribe tu contraseña"
          aria-describedby="passwordHelp">
        <!-- <div id="passwordHelp" class="form-text">Deben ser 8 caracteres como mínimo</div> -->

      </div>
      <button type="submit" class="btn btn-primary w-100 mt-4">Ingresar</button>
    </form>
    <hr>
    <p class="text-center"><small class="text-muted">O Ingresa Con</small></p>
    <div class="text-center d-flex flex-column">
      <button class="btn btn-light border-dark-subtle mb-3">Ingresar con Facebook</button>
      <button class="btn btn-light border-dark-subtle mb-3">Ingresar con Google</button>
    </div>
    <p class="text-center">
      <span class="text-muted">No tienes Cuenta? </span>
      <NuxtLink href="/pacientes/registro" class="btn-link text-dark fw-medium">Registrate</NuxtLink>
    </p>
  </NuxtLayout>
</template>

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
  background-color: #EBECF7;
  background-image: url('@/src/assets/bg-login.svg');
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