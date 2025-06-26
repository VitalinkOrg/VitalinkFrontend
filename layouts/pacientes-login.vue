<template>
  <WebsiteNav />
  <main class="d-flex" style="background-color: #ffffff">
    <section class="left text-center d-lg-flex d-none">
      <NuxtLink class="logo" href="/"
        ><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink Logo"
      /></NuxtLink>
      <img src="@/src/assets/img-login.png" alt="" />
      <p class="fs-5 w-50 fw-normal text-muted">
        ¡Comienza tu viaje hacia un mejor cuidado de la salud hoy mismo!
      </p>
    </section>
    <section class="right">
      <div class="card border-0 w-100 h-100" style="background-color: #ffffff">
        <div class="card-body p-5 rounded-4 h-100">
          <slot />
        </div>
      </div>
    </section>
  </main>
</template>
<style src="@/assets/styles/vitalink.scss" />

<style lang="scss" scoped>
main {
  min-height: 100vh;
}

.logo {
  img {
    width: 10rem;
  }
}

.left {
  height: 100vh;
  width: 100%;
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
  position: sticky;
  top: 0;
  bottom: 0;
}

.right {
  padding: 1rem;
  overflow-y: auto;
  min-height: 100vh;
  width: 100%;
}
</style>
