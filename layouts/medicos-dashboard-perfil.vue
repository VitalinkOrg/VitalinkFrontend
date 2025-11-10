<template>
  <NuxtLayout name="medicos-dashboard">
    <header class="medical-dashboard__header">
      <nav class="breadcrumb-nav" aria-label="Navegación de migas de pan">
        <ol class="breadcrumb-nav__list">
          <li class="breadcrumb-nav__item">
            <NuxtLink
              href="/medicos/inicio"
              class="breadcrumb-nav__link breadcrumb-nav__link--muted"
            >
              Inicio
            </NuxtLink>
          </li>
        </ol>
      </nav>

      <h1 class="medical-dashboard__title">Configuración de tu Perfil</h1>
    </header>

    <div class="profile-nav">
      <ul class="profile-nav__list">
        <li class="profile-nav__item">
          <NuxtLink
            href="/medicos/perfil"
            class="profile-nav__link"
            active-class="profile-nav__link--active"
          >
            Datos Personales
          </NuxtLink>
        </li>
        <li class="profile-nav__item">
          <NuxtLink
            href="/medicos/perfil/profesional"
            class="profile-nav__link"
            active-class="profile-nav__link--active"
          >
            Datos Profesionales
          </NuxtLink>
        </li>
        <li class="profile-nav__item">
          <NuxtLink
            href="/medicos/perfil/educacion-experiencia"
            class="profile-nav__link"
            active-class="profile-nav__link--active"
          >
            Educación y Experiencia
          </NuxtLink>
        </li>
        <li class="profile-nav__item">
          <NuxtLink
            href="/medicos/perfil/especialidades"
            class="profile-nav__link"
            active-class="profile-nav__link--active"
          >
            Especialidades
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div class="profile-card">
      <div class="profile-card__body">
        <slot />
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.medical-dashboard {
  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 0.5rem;

    @include respond-to-max(md) {
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.25rem;
    letter-spacing: 0;

    @include respond-to-max(md) {
      font-size: 1.125rem;
      line-height: 1.375rem;
    }

    @include respond-to-max(sm) {
      font-size: 1rem;
      line-height: 1.25rem;
    }
  }
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  --breadcrumb-divider: "/";

  &__list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    flex-wrap: wrap;
    gap: 2.0625rem;

    @include respond-to-max(md) {
      gap: 1.5rem;
    }

    @include respond-to-max(sm) {
      gap: 1rem;
    }

    li + li::before {
      content: var(--breadcrumb-divider);
      padding: 0 0.5rem;
      color: #6c757d;

      @include respond-to-max(sm) {
        padding: 0 0.375rem;
      }
    }
  }

  &__item {
    font-size: 0.75rem;

    @include respond-to-max(sm) {
      font-size: 0.6875rem;
    }

    &--active .breadcrumb-nav__text {
      color: #6c757d;
    }
  }

  &__link {
    text-decoration: none;
    color: inherit;

    &--muted {
      color: #6c757d;
    }

    &:hover,
    &:focus-visible {
      text-decoration: underline;
      outline: 0.125rem solid transparent;
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
      border-radius: 0.125rem;
    }
  }

  &__text {
    color: inherit;
  }
}

.profile-nav {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  @include respond-to-max(md) {
    margin-bottom: 1.25rem;
  }

  @include respond-to-max(sm) {
    margin-bottom: 1rem;
  }

  &__list {
    display: flex;
    flex-direction: row;
    width: 100%;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 2.0625rem;

    @include respond-to-max(lg) {
      gap: 1.5rem;
    }

    @include respond-to-max(md) {
      gap: 1rem;
    }

    @include respond-to-max(sm) {
      gap: 0.75rem;
      flex-wrap: nowrap;
    }
  }

  &__item {
    display: flex;
    flex-shrink: 0;
  }

  &__link {
    display: block;
    padding: 0.625rem 0.5rem;
    text-decoration: none;
    color: #6d758f;
    border-bottom: 0.125rem solid transparent;
    transition:
      color 0.15s ease-in-out,
      border-color 0.15s ease-in-out;
    position: relative;
    top: 0.0625rem;
    font-weight: 300;
    font-size: 1rem;
    line-height: 100%;
    letter-spacing: 0;
    white-space: nowrap;

    @include respond-to-max(md) {
      font-size: 0.875rem;
      padding: 0.5rem 0.375rem;
    }

    @include respond-to-max(sm) {
      font-size: 0.8125rem;
      padding: 0.5rem 0.25rem;
    }

    &:hover:not(.profile-nav__link--active),
    &:focus-visible:not(.profile-nav__link--active) {
      color: $color-primary;
      border-bottom-color: rgba($color-primary, 0.3);
    }

    &--active {
      font-weight: 600;
      line-height: 100%;
      color: $color-primary;
      border-bottom-color: $color-primary;
    }
  }
}

.profile-card {
  background-color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);

  @include respond-to-max(sm) {
    border-radius: 0.375rem;
    box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.075);
  }

  &__body {
    padding: 1.5rem;

    @include respond-to-max(md) {
      padding: 1.25rem;
    }

    @include respond-to-max(sm) {
      padding: 1rem;
    }
  }
}
</style>
