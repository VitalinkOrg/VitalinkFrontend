<template>
  <main class="d-flex" style="background-color: #F8F8F8">
    <section class="left text-center d-sm-flex d-none">
      <!-- <NuxtLink class="logo" href="/"><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink Logo"></NuxtLink> -->
      <!-- <img src="@/src/assets/img-login.png" alt=""> -->
      <div>
        <h1 class="text-primary">Únete a la Comunidad<br>Médica de Vitalink</h1>
        <p class="fs-5 fw-light text-muted mx-auto my-4">Selecciona tu Rol Médico y Comienza a Conectar con Pacientes
        </p>
        <div class="d-flex justify-content-center">
          <NuxtLink href="/medicos/registro" class="btn-custom btn-custom-inactive rounded-4">
            <span class="btn-custom-check"></span>
            <span class="btn-custom-text btn-custom-inactive-text fw-semibold">Médico</span>
          </NuxtLink>
          <span class="btn-custom btn-custom-active rounded-4">
            <span class="btn-custom-check"></span>
            <span class="btn-custom-text btn-custom-active-text fw-semibold">Hospital</span>
          </span>
        </div>
      </div>
    </section>
    <section class="right">
      <div class="card border-0 w-100" style="background-color: #F8FAFF; max-width: 30rem">
        <div class="card-body p-5 rounded-4">
          CClinicas Registro
        </div>
      </div>

    </section>
  </main>
</template>
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
  background-color: #EBECF7;
  background-image: url('@/src/assets/bg-login-medicos-clinicas.svg');
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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
    background-color: #3541B4;
    box-shadow: 13px 9px 51.3px 0px rgba(0, 0, 0, 0.15), 0 0 0 9px #C2EBEE;
    background-image: url('@/src/assets/img-icon-clinica-active.svg');

    &-text {
      background: linear-gradient(0deg, #0CADBB 35.25%, #C2EBEE 149.99%);
      color: white;
    }
  }

  &-inactive {
    background-color: white;
    background-image: url('@/src/assets/img-icon-medico-inactive.svg');

    &-text {
      background-color: #E7F7F8;
      color: #85D6DD;
    }
  }

  &-text {
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    border-radius: .7rem;
  }

  &-check {}
}
</style>