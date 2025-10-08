<template>
  <NuxtLayout name="web">
    <main class="insurance-register">
      <img
        src="@/src/assets/background-pattern.svg"
        alt=""
        class="insurance-register__background-pattern"
      />
      <section class="insurance-register__container">
        <div class="insurance-register__content">
          <article class="insurance-register__information">
            <header class="insurance-register__header">
              <h1 class="insurance-register__title">
                Maximiza tu Presencia Médica Online
              </h1>
              <p class="insurance-register__description">
                Registrate ahora para gestionar tu actividad y la de tus
                asegurados dentro de Vitalink.
              </p>
            </header>
            <figure class="insurance-register__image-wrapper">
              <img
                src="@/src/assets/img-login-aseguradoras.png"
                class="insurance-register__main-image"
                alt="Ilustración de registro para aseguradoras médicas"
              />
            </figure>
          </article>
          <aside class="insurance-register__form-wrapper">
            <div class="insurance-register__form-container">
              <AseguradorasRegistroFormulario />
            </div>
          </aside>
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth-login"],
});
</script>

<style lang="scss" scoped>
@mixin mobile {
  @media (max-width: #{$breakpoint-md}) {
    @content;
  }
}

@mixin tablet {
  @media (max-width: #{$breakpoint-lg}) {
    @content;
  }
}

@mixin tablet-up {
  @media (min-width: #{$breakpoint-lg + 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$breakpoint-xl}) {
    @content;
  }
}

@mixin desktop-large {
  @media (min-width: #{$breakpoint-xxl}) {
    @content;
  }
}

.insurance-register {
  position: relative;
  min-height: 100vh;
  background-color: #e2e4fa;
  display: grid;

  &__background-pattern {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
    top: 0;
    left: 0;
    object-fit: cover;

    @include mobile {
      object-position: center;
    }
  }

  &__container {
    padding: 1.25rem 3.75rem;
    position: relative;
    z-index: 1;

    @include tablet {
      padding: 1.25rem 2rem;
    }

    @include mobile {
      padding: 1rem 1.25rem;
    }
  }

  &__content {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 1.5rem 0;
    align-items: center;

    @include desktop-large {
      gap: 3rem;
      margin: 2rem 0;
    }

    @include tablet {
      grid-template-columns: 1fr;
      gap: 2rem;
      margin: 1rem 0;
    }

    @include mobile {
      gap: 1.5rem;
      margin: 0.5rem 0;
    }
  }

  &__information {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    @include tablet {
      order: 2;
      gap: 1.5rem;
    }

    @include mobile {
      gap: 1rem;
    }
  }

  &__header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    @include mobile {
      gap: 0.75rem;
    }
  }

  &__title {
    @include text-base;
    font-family: $font-family-montserrat-alt;
    font-weight: 800;
    font-size: 2.734rem;
    line-height: 127%;
    letter-spacing: -0.125rem;
    text-align: center;
    max-width: 34rem;
    margin: 0;

    @include desktop-large {
      font-size: 3rem;
      max-width: 40rem;
    }

    @include tablet {
      font-size: 2.25rem;
      max-width: 30rem;
      letter-spacing: -0.0625rem;
    }

    @include mobile {
      font-size: 1.75rem;
      max-width: 100%;
      line-height: 120%;
      letter-spacing: -0.03125rem;
    }
  }

  &__description {
    @include text-base;
    font-weight: 300;
    font-size: 1.25rem;
    line-height: 150%;
    letter-spacing: -0.125rem;
    text-align: center;
    color: #353e5c;
    max-width: 28.1875rem;
    margin: 0;

    @include desktop-large {
      font-size: 1.375rem;
      max-width: 32rem;
    }

    @include tablet {
      font-size: 1.125rem;
      max-width: 26rem;
      letter-spacing: -0.0625rem;
    }

    @include mobile {
      font-size: 1rem;
      max-width: 100%;
      line-height: 140%;
      letter-spacing: normal;
    }
  }

  &__image-wrapper {
    width: 100%;
    margin: 0;
    display: flex;
    justify-content: center;

    @include tablet {
      max-width: 400px;
      margin: 0 auto;
    }

    @include mobile {
      max-width: 300px;
    }
  }

  &__main-image {
    width: 100%;
    height: auto;
    display: block;
    max-width: 100%;
  }

  &__form-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: center;

    @include tablet {
      order: 1;
      align-items: center;
    }

    @include mobile {
      align-items: stretch;
    }
  }

  &__form-container {
    padding: 1.5rem 2.1875rem;
    border-radius: 1.5625rem;
    background: $white;
    box-shadow: 0px 0px 2.2375rem 0px rgba(0, 0, 0, 0.1);
    width: 100%;

    @include desktop-large {
      padding: 2rem 2.5rem;
      border-radius: 2rem;
    }

    @include tablet {
      max-width: 600px;
      padding: 2rem;
      border-radius: 1.25rem;
    }

    @include mobile {
      padding: 1.5rem 1.25rem;
      border-radius: 1rem;
      box-shadow: 0px 0px 1.5rem 0px rgba(0, 0, 0, 0.1);
    }
  }
}

.insurance-register {
  &--dark-mode {
    background-color: #1a1a2e;

    .insurance-register__title {
      color: #fff;
    }

    .insurance-register__description {
      color: #b8b8d1;
    }
  }

  &--compact {
    .insurance-register__container {
      padding: 1rem 2rem;
    }

    .insurance-register__content {
      gap: 1.5rem;
      margin: 1rem 0;
    }
  }
}

.insurance-register__form-container {
  &--loading {
    opacity: 0.7;
    pointer-events: none;

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 2rem;
      height: 2rem;
      margin: -1rem 0 0 -1rem;
      border: 0.125rem solid transparent;
      border-top: 0.125rem solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  &--error {
    border: 0.125rem solid #dc3545;
    box-shadow: 0px 0px 2.2375rem 0px rgba(220, 53, 69, 0.2);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .insurance-register__form-container--loading::after {
    animation: none;
  }
}

@media (min-width: 1600px) {
  .insurance-register {
    &__container {
      max-width: 1400px;
      margin: 0 auto;
    }

    &__content {
      gap: 4rem;
    }
  }
}

@media (max-width: 768px) and (orientation: landscape) {
  .insurance-register {
    &__content {
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      align-items: stretch;
    }

    &__information {
      order: 1;
    }

    &__form-wrapper {
      order: 2;
    }

    &__title {
      font-size: 1.5rem;
    }

    &__description {
      font-size: 0.875rem;
    }
  }
}
</style>
