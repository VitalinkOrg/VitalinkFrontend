<template>
  <NuxtLayout name="pacientes-dashboard">
    <div class="account-page">
      <p class="account-page__header">
        <span class="account-page__title">Mi Cuenta</span>
      </p>

      <div class="account-page__nav">
        <ul class="account-page__nav-list">
          <li class="account-page__nav-item">
            <NuxtLink
              href="/pacientes/cuenta"
              replace
              class="account-page__nav-link"
              active-class="account-page__nav-link--active"
            >
              Configuración de la cuenta
            </NuxtLink>
          </li>
          <li class="account-page__nav-item">
            <NuxtLink
              href="/pacientes/notificaciones"
              replace
              class="account-page__nav-link"
              active-class="account-page__nav-link--active"
            >
              Notificaciones
            </NuxtLink>
          </li>
          <li class="account-page__nav-item">
            <NuxtLink
              href="/pacientes/eliminar-cuenta"
              replace
              class="account-page__nav-link"
              active-class="account-page__nav-link--active"
            >
              Eliminar cuenta
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="account-page__card">
        <div class="account-page__card-body">
          <slot />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.account-page {
  background-color: #f8f8f8;
  padding: 1rem;

  @include respond-to(sm) {
    padding: 1.5rem;
  }

  @include respond-to(md) {
    padding: 2rem;
  }

  @include respond-to(lg) {
    padding: 3rem;
  }

  &__header {
    margin: 0;
  }

  &__title {
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    letter-spacing: 0;
    color: $color-foreground;

    @include respond-to(md) {
      font-size: 20px;
    }
  }

  &__nav {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin: 12px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    @include respond-to(md) {
      margin: 16px 0;
      overflow-x: visible;
    }
  }

  &__nav-list {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: 12px;

    @include respond-to(sm) {
      gap: 20px;
    }

    @include respond-to(md) {
      gap: 24px;
    }

    @include respond-to(lg) {
      gap: 33px;
    }
  }

  &__nav-item {
    flex-shrink: 0;
  }

  &__nav-link {
    font-weight: 300;
    font-size: 13px;
    line-height: 100%;
    letter-spacing: 0;
    display: block;
    padding: 0.5rem 0;
    text-decoration: none;
    color: $color-text-secondary;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition:
      color 0.15s ease-in-out,
      border-color 0.15s ease-in-out;

    @include respond-to(sm) {
      font-size: 14px;
    }

    @include respond-to(md) {
      font-size: 16px;
    }

    &:hover {
      color: $color-primary;
    }

    &--active {
      font-weight: 600;
      color: $color-primary;
      border-bottom-color: $color-primary;
    }
  }

  &__card {
    background-color: #fff;
    border: none;
    border-radius: 0.5rem;
  }

  &__card-body {
    padding: 1rem;

    @include respond-to(sm) {
      padding: 1.25rem;
    }

    @include respond-to(md) {
      padding: 1.5rem;
    }

    @include respond-to(lg) {
      padding: 1.75rem;
    }
  }
}
</style>
