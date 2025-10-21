<template>
  <NuxtLayout name="web">
    <main class="main">
      <section class="hero" id="home">
        <div class="hero__content">
          <h1 class="hero__title">
            Tu procedimiento médico,
            <span class="hero__title--highlight">más fácil que nunca</span>.
            Encuentra, agenda y empieza hoy
          </h1>
          <p class="hero__description">
            Facilitar el acceso a servicios médicos de calidad, conectando a los
            pacientes con especialistas, opciones de financiamiento y reservas
            seguras, todo desde un solo lugar
          </p>
        </div>
        <WebsiteFormularioBusquedaMedica />
        <WebsiteUltimasBusquedas />
      </section>

      <section class="featured" id="key_benefits">
        <div class="featured__header">
          <span class="featured__header-badge">Beneficios Clave</span>
          <h2 class="featured__header-title">¿Por qué elegir Vitalink?</h2>
        </div>

        <div class="featured__card-grid">
          <div class="featured__card">
            <div class="featured__card-wrapper">
              <div class="featured__card-icon">
                <AtomsIconsDoctorIcon size="25" />
              </div>
              <h3 class="featured__card-text">
                Profesionales de la salud altamente calificados
              </h3>
              <p class="featured__card-description">
                Confianza y experiencia en cada procedimiento
              </p>
            </div>
          </div>
          <div class="featured__card">
            <div class="featured__card-wrapper">
              <div class="featured__card-icon">
                <AtomsIconsDollarIcon size="25" />
              </div>
              <h3 class="featured__card-text">
                Sin membresías ni costos ocultos
              </h3>
              <p class="featured__card-description">
                Accede a todos los servicios sin pagos recurrentes
              </p>
            </div>
          </div>

          <div class="featured__card">
            <div class="featured__card-wrapper">
              <div class="featured__card-icon">
                <Icon name="mynaui:credit-card" size="25" />
              </div>
              <h3 class="featured__card-text">Opciones de pago flexibles</h3>
              <p class="featured__card-description">
                Accede a opciones de crédito y paga el día de tu cita y
                procedimiento
              </p>
            </div>
          </div>

          <div class="featured__card">
            <div class="featured__card-wrapper">
              <div class="featured__card-icon">
                <Icon name="ri:guide-line" size="25" />
              </div>
              <h3 class="featured__card-text">Acompañamiento personalizado</h3>
              <p class="featured__card-description">
                Te guiamos desde la búsqueda hasta la realización de tu
                procedimiento
              </p>
            </div>
          </div>
        </div>
      </section>

      <WebsiteSteps />

      <section class="banner" id="trust">
        <div class="banner__content">
          <img
            class="banner__background-pattern"
            src="@/src/assets/banner-background-pattern.svg"
            alt=""
          />
          <div class="banner__text-wrapper">
            <h3 class="banner__title">
              Tu seguridad y bienestar, nuestra prioridad
            </h3>
            <p class="banner__description">
              Protegemos tus datos, garantizamos transacciones seguras y solo
              trabajamos con profesionales de la salud con trayectoria
              comprobada.
            </p>
          </div>
        </div>
      </section>

      <WebsiteContenidoInformativo />

      <section class="call-to-action">
        <img
          class="call-to-action__background-pattern"
          src="@/src/assets/banner-background-pattern.svg"
          alt=""
        />
        <div class="call-to-action__content">
          <h3 class="call-to-action__text">
            Da el primer paso hacia tu bienestar, hoy
          </h3>
          <button class="call-to-action__button">
            <span class="call-to-action__button--text">
              Buscar especialista
              <AtomsIconsArrowRightIcon class="call-to-action__button--icon" />
            </span>
          </button>
        </div>
      </section>

      <WebsitePreguntasFrecuentes />
    </main>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.main {
  overflow-x: hidden;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: $white;
  padding: 5rem 1rem;

  @include respond-to(md) {
    padding: 5rem 2rem;
  }

  @include respond-to(lg) {
    padding: 5rem 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 700;
    font-size: 1.75rem;
    line-height: 125%;
    letter-spacing: 0;
    text-align: center;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 1rem;

    @include respond-to(sm) {
      font-size: 2rem;
    }

    @include respond-to(md) {
      font-size: 2.25rem;
    }

    @include respond-to(lg) {
      font-size: 2.625rem;
      max-width: 57.6875rem;
      padding: 0;
    }

    &--highlight {
      background-image: linear-gradient(45deg, #0cadbb, #3541b4);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
    }
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 1rem;
    line-height: 125%;
    letter-spacing: 0;
    text-align: center;
    color: #6d758f;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 1rem;

    @include respond-to(md) {
      font-size: 1.0625rem;
    }

    @include respond-to(lg) {
      font-size: 1.125rem;
      max-width: 53.3125rem;
      padding: 0;
    }
  }
}

.featured {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.5rem 1rem;
  background: #e7f7f8;

  @include respond-to(md) {
    gap: 2.5rem;
    padding: 3rem 2rem;
  }

  @include respond-to(lg) {
    gap: 40px;
    padding: 50px 0;
  }

  &__header {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;

    @include respond-to(md) {
      gap: 19px;
    }
  }

  &__header-badge {
    font-weight: 500;
    font-size: 14px;
    line-height: 125%;
    letter-spacing: 0;
    border-radius: 20px;
    gap: 10px;
    border-width: 1px;
    padding: 8px 12px;
    color: #0cadbb;
    background: rgba(12, 173, 187, 0.1);
    border: 1px solid rgba(12, 173, 187, 0.2);
    text-align: center;

    @include respond-to(md) {
      font-size: 16px;
      padding: 10px;
    }
  }

  &__header-title {
    font-weight: 700;
    font-size: 1.75rem;
    line-height: 125%;
    letter-spacing: 0;
    text-align: center;
    color: #19213d;

    @include respond-to(sm) {
      font-size: 2rem;
    }

    @include respond-to(md) {
      font-size: 2.25rem;
    }

    @include respond-to(lg) {
      font-size: 42px;
    }
  }

  &__card-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 100%;
    margin: 0 auto;

    @include respond-to(md) {
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      max-width: 794px;
    }

    @include respond-to(lg) {
      gap: 24px;
    }
  }

  &__card {
    background: $white;
    border-radius: 20px;
    box-shadow: 0px 4px 20.9px 0px rgba(12, 173, 187, 0.1);
    padding: 10px;
  }

  &__card-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 180px;
    height: 100%;
    border-radius: 12px;
    border: 1px solid #c2ebee;
    padding: 20px 16px;

    @include respond-to(md) {
      min-height: 206px;
      padding: 28px 20px;
    }
  }

  &__card-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    padding: 7.42px 10.39px;
    gap: 14.85px;
    color: $white;
    background-color: #0cadbb;
    box-shadow: 0px 14.85px 23.76px 0px rgba(20, 37, 63, 0.06);
    box-shadow: 0px 0px 1.48px 0px rgba(12, 26, 75, 0.1);
    margin-bottom: 16px;

    @include respond-to(md) {
      margin-bottom: 19px;
    }
  }

  &__card-text {
    font-weight: 700;
    font-style: Bold;
    font-size: 16px;
    line-height: 125%;
    letter-spacing: 0;
    color: #19213d;

    @include respond-to(md) {
      font-size: 18px;
    }
  }

  &__card-description {
    font-weight: 400;
    font-size: 14px;
    line-height: 125%;
    letter-spacing: 0;
    color: #6d758f;

    @include respond-to(md) {
      font-size: 16px;
    }
  }

  &__card-link {
    font-weight: 600;
    font-size: 14px;
    line-height: 125%;
    letter-spacing: 0;
    color: #0cadbb;
    margin-top: auto;

    @include respond-to(md) {
      font-size: 16px;
    }

    &:hover {
      text-decoration: underline;
    }
  }
}

.banner {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.5rem 1rem;

  @include respond-to(md) {
    gap: 2.5rem;
    padding: 3rem 2rem;
  }

  @include respond-to(lg) {
    gap: 40px;
    padding: 50px 92px;
  }

  &__content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(90deg, #3541b4 0%, #0cadbb 100%);
    margin: 0 auto;
    max-width: 100%;
    padding: 2rem 1.5rem;
    border-radius: 16px;
    overflow: hidden;

    @include respond-to(md) {
      padding: 3rem 4rem;
      border-radius: 20px;
    }

    @include respond-to(lg) {
      max-width: 1065px;
      padding: 52px 106px;
    }
  }

  &__background-pattern {
    position: absolute;
    opacity: 0.1;
    width: 100%;
  }

  &__text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;

    @include respond-to(md) {
      gap: 2rem;
    }

    @include respond-to(lg) {
      gap: 35px;
    }
  }

  &__title {
    font-weight: 700;
    font-size: 1.25rem;
    line-height: 125%;
    letter-spacing: 0;
    text-align: center;
    color: $white;

    @include respond-to(md) {
      font-size: 1.5rem;
    }

    @include respond-to(lg) {
      font-size: 18px;
    }
  }

  &__description {
    font-weight: 500;
    font-size: 1rem;
    line-height: 125%;
    letter-spacing: 0;
    text-align: center;
    color: $white;

    @include respond-to(md) {
      font-size: 1.125rem;
    }

    @include respond-to(lg) {
      font-size: 18px;
    }
  }
}

.informative-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.5rem 1rem;

  @include respond-to(md) {
    gap: 2.5rem;
    padding: 3rem 2rem;
  }

  @include respond-to(lg) {
    gap: 40px;
    padding: 50px 0;
  }

  &__header {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;

    @include respond-to(md) {
      gap: 19px;
    }
  }

  &__header-badge {
    font-weight: 500;
    font-size: 14px;
    line-height: 125%;
    letter-spacing: 0;
    border-radius: 20px;
    gap: 10px;
    border-width: 1px;
    padding: 8px 12px;
    color: #0cadbb;
    background: rgba(12, 173, 187, 0.1);
    border: 1px solid rgba(12, 173, 187, 0.2);
    text-align: center;

    @include respond-to(md) {
      font-size: 16px;
      padding: 10px;
    }
  }

  &__header-title {
    font-weight: 700;
    font-size: 1.75rem;
    line-height: 125%;
    letter-spacing: 0;
    text-align: center;
    color: #19213d;

    @include respond-to(sm) {
      font-size: 2rem;
    }

    @include respond-to(md) {
      font-size: 2.25rem;
    }

    @include respond-to(lg) {
      font-size: 42px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @include respond-to(md) {
      gap: 30px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    gap: 12px;
    width: 100%;

    @include respond-to(sm) {
      flex-direction: row;
      gap: 16px;
    }

    @include respond-to(md) {
      gap: 21px;
    }
  }

  &__toggle-button {
    width: 100%;

    @include respond-to(sm) {
      width: auto;
    }

    &--primary {
      @include gradient-button;
      padding: 14px 16px;
      border-radius: 16px;

      @include respond-to(md) {
        padding: 16px;
        border-radius: 20px;
      }
    }

    &--outline {
      @include outline-button;
      padding: 14px 16px;
      border-radius: 16px;

      @include respond-to(md) {
        padding: 16px;
        border-radius: 20px;
      }
    }
  }

  &__cards-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 100%;
    margin: 0 auto;

    @include respond-to(md) {
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      max-width: 791px;
    }

    @include respond-to(lg) {
      gap: 24px;
    }
  }
}

.call-to-action {
  background: linear-gradient(90deg, #3541b4 0%, #0cadbb 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  &__background-pattern {
    position: absolute;
    opacity: 0.1;
    width: 100%;
    z-index: 0;
  }

  &__content {
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    padding: 3rem 1rem;

    @include respond-to(md) {
      gap: 2.5rem;
      padding: 4rem 2rem;
    }

    @include respond-to(lg) {
      gap: 45px;
      padding: 78px 0;
    }
  }

  &__text {
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 125%;
    letter-spacing: 0;
    text-align: center;
    color: $white;
    max-width: 100%;
    padding: 0 1rem;

    @include respond-to(sm) {
      font-size: 1.75rem;
    }

    @include respond-to(md) {
      font-size: 2rem;
      max-width: 500px;
    }

    @include respond-to(lg) {
      font-size: 42px;
      max-width: 578px;
      padding: 0;
    }
  }

  &__button {
    @include button-base;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    box-shadow: 0px 1px 2px 0px #1018280d;
    background: #ffffff;
    padding: 12px 20px;
    width: 100%;
    max-width: 280px;

    @include respond-to(sm) {
      width: auto;
    }

    &--text {
      background: linear-gradient(90deg, #5663e3 0%, #0cabb9 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &--icon {
      color: #0cabb9;
    }
  }
}
</style>
