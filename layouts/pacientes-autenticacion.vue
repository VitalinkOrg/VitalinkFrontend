<template>
  <WebsiteNav />
  <main class="layout-main">
    <section
      class="left text-center layout-main__left layout-main__left--hidden-sm"
    >
      <NuxtLink class="layout-main__logo" href="/"
        ><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink Logo"
      /></NuxtLink>
      <img src="@/src/assets/img-login.png" alt="Login Image" />
      <p class="layout-main__description">
        ¡Comienza tu viaje hacia un mejor cuidado de la salud hoy mismo!
      </p>
    </section>
    <section class="layout-main__right">
      <div class="login-card">
        <div class="login-card__body">
          <slot />
        </div>
      </div>
    </section>
  </main>
</template>
<style src="@/assets/styles/vitalink.scss" />

<style lang="scss" scoped>
.layout-main {
  display: flex;
  min-height: 100vh;
  background-color: #ffffff;

  &__left {
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

    height: 100vh;
    width: 100%;

    @media (max-width: 992px) {
      &--hidden-sm {
        display: none;
      }
    }
  }

  &__right {
    padding: 1rem;
    overflow-y: auto;
    min-height: 100vh;
    width: 100%;
  }

  &__logo {
    img {
      width: 10rem;
    }
  }

  &__logo img {
    width: 10rem;
  }

  &__description {
    font-size: 1rem;
    font-weight: 400;
    color: $color-text-muted;
    width: 50%;
  }
}

.login-card {
  border: none;
  background-color: transparent;
  height: 100%;

  &__body {
    padding: $spacing-lg * 2;
    border-radius: $border-radius-md;
    height: 100%;
    background-color: #ffffff;
  }
}
</style>
