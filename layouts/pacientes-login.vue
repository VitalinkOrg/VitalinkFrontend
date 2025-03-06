<template>
	<WebsiteNav />
  <main class="d-flex" style="background-color: #F8F8F8">
    <section class="left text-center d-sm-flex d-none">
      <NuxtLink class="logo" href="/"><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink Logo"></NuxtLink>
      <img src="@/src/assets/img-login.png" alt="">
      <p class="fs-5 w-50 fw-normal text-muted">¡Comienza tu viaje hacia un mejor cuidado de la salud hoy mismo!</p>
    </section>
    <section class="right">
      <div class="card border-0 w-100 h-100" style="background-color: #F8FAFF; ">
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
  overflow-y: auto;
}
</style>
