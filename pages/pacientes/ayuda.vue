<script lang="ts" setup>
const open = ref<boolean>(false);
const tab = ref<number>(1);
const claimSentRef = ref<any>(null);

const submitClaimForm = () => {
  if (claimSentRef.value) {
    claimSentRef.value.openModal();
  }
};
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <main class="help-page">
      <div class="help-page__back-link-container">
        <NuxtLink href="/pacientes/cuenta" class="help-page__back-link">
          <AtomsIconsArrowLeftIcon />
          Ayuda y Soporte
        </NuxtLink>
      </div>
      <div class="help-page__container">
        <div class="help-page__header">
          <img
            class="help-page__image-banner"
            src="@/src/assets/ayuda-soporte-banner.png"
          />
          <h4 class="help-page__title">
            Bienvenido a la página de ayuda y soporte de Vitalink
          </h4>
          <div class="help-page__search">
            <div class="help-page__search-input-wrapper">
              <UiSearchInput
                placeholder="Escribe un problema o preugnta que tenga"
              />
            </div>
            <div class="help-page__search-button-wrapper">
              <button type="submit" class="help-page__search-button">
                Buscar
              </button>
            </div>
          </div>
        </div>

        <div class="help-page__content">
          <div class="help-page__tabs">
            <div
              class="help-page__tab"
              :class="{ 'help-page__tab--active': open }"
              @click="open = true"
            >
              FAQs
            </div>
            <div
              class="help-page__tab"
              :class="{ 'help-page__tab--active': !open }"
              @click="open = false"
            >
              Realizar un reclamo
            </div>
          </div>

          <div v-if="!open" class="help-page__claim">
            <p class="help-page__claim-description">
              Si tienes algún problema con tu cuenta de Vitalink, puedes
              completar el siguiente formulario y nosotros nos encargaremos de
              ayudarte
            </p>
            <form class="help-page__form" @submit.prevent="submitClaimForm">
              <div class="help-page__form-card">
                <h6 class="help-page__form-title">Formulario de reclamos</h6>
                <hr class="help-page__divider" />
                <div class="help-page__form-content">
                  <h6 class="help-page__form-section-title">
                    Datos Personales de quien solicita el reclamo
                  </h6>
                  <div class="help-page__form-group">
                    <label for="nombre" class="help-page__label"
                      >Nombre (s)</label
                    >
                    <input
                      type="text"
                      placeholder="Escribe tu nombre"
                      class="help-page__input"
                      id="nombre"
                      name="nombre"
                    />
                  </div>
                  <div class="help-page__form-group">
                    <label for="apellido" class="help-page__label"
                      >Apellido (s)</label
                    >
                    <input
                      type="text"
                      placeholder="Escribe tu apellido"
                      class="help-page__input"
                      id="apellido"
                      name="apellido"
                    />
                  </div>
                  <div class="help-page__form-group">
                    <label for="email" class="help-page__label"
                      >Correo Electrónico</label
                    >
                    <input
                      type="email"
                      placeholder="Escribe tu correo electrónico"
                      class="help-page__input"
                      id="email"
                      name="email"
                    />
                  </div>
                  <div class="help-page__form-group">
                    <label for="telefono" class="help-page__label"
                      >Número de teléfono</label
                    >
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      class="help-page__input"
                      id="telefono"
                      name="telefono"
                    />
                  </div>
                  <div class="help-page__form-group">
                    <label for="direccion" class="help-page__label"
                      >Dirección</label
                    >
                    <input
                      type="text"
                      placeholder="Dirección"
                      class="help-page__input"
                      id="direccion"
                      name="direccion"
                    />
                  </div>
                  <hr class="help-page__divider" />
                  <h6 class="help-page__form-section-title">
                    ¿Cuál es el inconveniente?
                  </h6>
                  <div class="help-page__form-group">
                    <label for="descripcion" class="help-page__label"
                      >Descripción</label
                    >
                    <textarea
                      placeholder="Escribe una descripción"
                      class="help-page__textarea"
                      id="descripcion"
                      rows="4"
                      name="descripcion"
                    ></textarea>
                  </div>
                </div>
                <hr class="help-page__divider" />
                <button type="submit" class="help-page__submit-button">
                  Enviar
                </button>
              </div>
            </form>
          </div>

          <div v-else class="help-page__faq">
            <h2 class="help-page__faq-title">Preguntas frecuentes</h2>
            <p class="help-page__faq-description">
              Estas son algunas preguntas y respuestas frecuentes sobre nuestros
              servicios.
            </p>
            <div class="help-page__faq-nav">
              <ul class="help-page__faq-nav-list">
                <li class="help-page__faq-nav-item">
                  <button
                    class="help-page__faq-nav-link"
                    :class="{ 'help-page__faq-nav-link--active': tab === 1 }"
                    @click="tab = 1"
                  >
                    General
                  </button>
                </li>
                <li class="help-page__faq-nav-item">
                  <button
                    class="help-page__faq-nav-link"
                    :class="{ 'help-page__faq-nav-link--active': tab === 2 }"
                    @click="tab = 2"
                  >
                    Citas
                  </button>
                </li>
                <li class="help-page__faq-nav-item">
                  <button
                    class="help-page__faq-nav-link"
                    :class="{ 'help-page__faq-nav-link--active': tab === 3 }"
                    @click="tab = 3"
                  >
                    Váuchers
                  </button>
                </li>
                <li class="help-page__faq-nav-item">
                  <button
                    class="help-page__faq-nav-link"
                    :class="{ 'help-page__faq-nav-link--active': tab === 4 }"
                    @click="tab = 4"
                  >
                    Servicios
                  </button>
                </li>
              </ul>
            </div>
            <PacientesPreguntasFrecuentes />
          </div>
        </div>
      </div>
    </main>
    <PacientesModalesReclamoEnviado ref="claimSentRef" />
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.help-page {
  background-color: #f8f9fa;

  &__back-link-container {
    max-width: 1140px;
    padding: 48px 15px 0 15px;
    margin: 0 auto;
  }

  &__container {
    max-width: 1078px;
    margin: 0 auto;
    padding: 48px 15px;
  }

  &__back-link {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0;
    color: $color-foreground;
    text-decoration: none;
    margin-bottom: 24px;

    &:hover {
      text-decoration: underline;
    }
  }

  &__image-banner {
    z-index: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__header {
    position: relative;
    overflow: hidden;
    background-color: rgba($color-primary, 0.1);
    padding: 48px;
    max-height: 200px;
    border-radius: 16px;
  }

  &__title {
    position: relative;
    z-index: 10;
    color: $color-primary;
    font-family: $font-family-montserrat-alt;
    font-weight: 700;
    font-style: Bold;
    font-size: 22px;
    line-height: 132%;
    letter-spacing: 0px;
    margin: 0 0 16px 0;
    max-width: 390px;
  }

  &__search {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__search-input-wrapper {
    flex: 0 0 auto;
    width: 41.666667%;

    @include respond-to-max(md) {
      width: 100%;
    }
  }

  &__search-input {
    @include input-base;
    width: 100%;
  }

  &__search-button-wrapper {
    position: relative;
    z-index: 10;
    flex: 0 0 auto;
  }

  &__search-button {
    @include primary-button;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 48px 0;
  }

  &__tabs {
    display: flex;
    justify-content: space-evenly;
    gap: 24px;
    width: 66.666667%;

    @include respond-to-max(md) {
      width: 100%;
      flex-direction: column;
    }
  }

  &__tab {
    flex: 0 0 auto;
    width: calc(35% - 12px);
    border-radius: 16px;
    font-weight: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 48px;
    font-size: 20px;
    cursor: pointer;
    background-color: rgba($primary-aqua, 0.1);
    color: $primary-aqua;
    border: none;
    transition: all 0.3s ease;

    @include respond-to-max(md) {
      width: 100%;
    }

    &--active {
      color: $white;
      background-color: $primary-aqua;
      border: 10px solid $primary-aqua-light;
    }
  }

  &__claim {
    width: 66.666667%;
    margin: 48px 0;

    @include respond-to-max(md) {
      width: 100%;
    }
  }

  &__claim-description {
    text-align: center;
    color: $color-text-secondary;
    margin-bottom: 48px;
    font-family: $font-family-main;
  }

  &__form-card {
    background-color: $white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &__form-title {
    text-align: center;
    padding: 24px 0 0 0;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0;
  }

  &__divider {
    border: none;
    border-top: 1px solid #dee2e6;
    margin: 16px 0;
  }

  &__form-content {
    background-color: #f8f9fa;
    margin: 12px;
    padding: 24px;
    border-radius: 8px;
  }

  &__form-section-title {
    font-weight: 600;
    font-family: $font-family-main;
    margin: 0 0 16px 0;
    font-size: 16px;
  }

  &__form-group {
    margin-bottom: 12px;
  }

  &__label {
    @include form-label;
    margin-bottom: 8px;
  }

  &__input {
    @include input-base;
    width: 100%;
  }

  &__textarea {
    @include input-base;
    width: 100%;
    resize: vertical;
  }

  &__submit-button {
    @include primary-button;
    width: calc(100% - 24px);
    margin: 12px;
  }

  &__faq {
    width: 66.666667%;
    margin: 48px 0;

    @include respond-to-max(md) {
      width: 100%;
    }
  }

  &__faq-title {
    text-align: center;
    font-weight: 600;
    font-family: $font-family-main;
    margin: 0 0 16px 0;
  }

  &__faq-description {
    text-align: center;
    color: $color-text-secondary;
    margin-bottom: 48px;
    font-family: $font-family-main;
  }

  &__faq-nav {
    margin-bottom: 24px;
  }

  &__faq-nav-list {
    display: flex;
    justify-content: space-evenly;
    list-style: none;
    padding: 0;
    margin: 0;
    border-bottom: 1px solid #dee2e6;
  }

  &__faq-nav-item {
    flex: 1;
    text-align: center;
  }

  &__faq-nav-link {
    @include button-base;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    color: $color-text-secondary;
    padding: 12px 16px;
    width: 100%;

    &--active {
      color: $primary-aqua;
      border-bottom-color: $primary-aqua;
    }

    &:hover {
      color: $primary-aqua;
    }
  }

  &__faq-items {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
}
</style>
