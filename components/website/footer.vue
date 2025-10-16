<template>
  <footer class="footer" role="contentinfo">
    <div class="footer__container">
      <div class="footer__brand">
        <img
          class="footer__logo"
          src="@/src/assets/img-vitalink-logo.svg"
          alt="VitaLink - Plataforma de atención médica"
          width="119"
          height="40"
        />
        <p class="footer__description">
          Comienza tu búsqueda hoy y experimenta la vitalidad de la atención
          médica excepcional con VitaLink!
        </p>
      </div>

      <div class="footer__bottom">
        <p class="footer__copyright">
          <span aria-label="Derechos de autor 2023 VitalinkCR"
            >Copyright © 2023 VitalinkCR</span
          >
          | Todos los derechos reservados |
          <NuxtLink
            class="footer__link"
            to="/terminos-y-condiciones"
            aria-label="Leer términos y condiciones"
          >
            Términos y Condiciones
          </NuxtLink>
          |
          <NuxtLink
            class="footer__link"
            to="/politica-privacidad"
            aria-label="Leer política de privacidad"
          >
            Política de Privacidad
          </NuxtLink>
        </p>

        <nav aria-label="Redes sociales">
          <ul class="footer__social-list">
            <li class="footer__social-item">
              <NuxtLink
                class="footer__social-link"
                to="https://facebook.com/vitalinkcr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar nuestra página de Facebook (se abre en nueva pestaña)"
              >
                <Icon
                  class="footer__social-icon"
                  name="fa6-brands:facebook"
                  aria-hidden="true"
                />
                <span class="visually-hidden">Facebook</span>
              </NuxtLink>
            </li>
            <li class="footer__social-item">
              <NuxtLink
                class="footer__social-link"
                to="https://instagram.com/vitalinkcr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar nuestra página de Instagram (se abre en nueva pestaña)"
              >
                <Icon
                  class="footer__social-icon"
                  name="fa6-brands:instagram"
                  aria-hidden="true"
                />
                <span class="visually-hidden">Instagram</span>
              </NuxtLink>
            </li>
            <li class="footer__social-item">
              <NuxtLink
                class="footer__social-link"
                to="https://linkedin.com/company/vitalinkcr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar nuestra página de LinkedIn (se abre en nueva pestaña)"
              >
                <Icon
                  class="footer__social-icon"
                  name="fa6-brands:linkedin"
                  aria-hidden="true"
                />
                <span class="visually-hidden">LinkedIn</span>
              </NuxtLink>
            </li>
            <li class="footer__social-item">
              <NuxtLink
                class="footer__social-link"
                to="https://youtube.com/@vitalinkcr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar nuestro canal de YouTube (se abre en nueva pestaña)"
              >
                <Icon
                  class="footer__social-icon"
                  name="fa6-brands:youtube"
                  aria-hidden="true"
                />
                <span class="visually-hidden">YouTube</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.footer {
  border-top: 1.05px solid #e1e4ed;

  &__container {
    max-width: 1274px;
    margin: 0 auto;
    padding: 34px 20px 58px 20px;
    @include space-y(60px);
  }

  &__brand {
    @include space-y(26px);
  }

  &__logo {
    display: block;
  }

  &__copyright,
  &__description {
    font-weight: 500;
    font-size: 14px;
    line-height: 125%;
    letter-spacing: 0;
    color: #6d758f;
  }

  &__description {
    max-width: 456px;
  }

  &__link {
    color: inherit;
    text-decoration: none;
    transition:
      color 0.2s ease,
      text-decoration-color 0.2s ease;

    &:hover,
    &:focus {
      color: #353e5c;
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid #4a567d;
      outline-offset: 2px;
      border-radius: 2px;
    }

    &:focus:not(:focus-visible) {
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid #4a567d;
      outline-offset: 2px;
    }
  }

  &__bottom {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  &__social-list {
    display: flex;
    list-style: none;
    gap: 16px;
    margin: 0;
    padding: 0;
  }

  &__social-item {
    margin: 0;
  }

  &__social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;

    &:hover {
      color: rgba(106, 117, 143, 0.1);
    }

    &:focus {
      outline: 2px solid #4a567d;
      outline-offset: 2px;
      background-color: rgba(106, 117, 143, 0.15);
    }

    &:focus:not(:focus-visible) {
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid #4a567d;
      outline-offset: 2px;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__social-icon {
    width: 18px;
    height: 18px;
    color: #353e5c;
    pointer-events: none;

    .footer__social-link:hover & {
      color: #4a567d;
    }
  }
}

@media (max-width: 768px) {
  .footer {
    &__bottom {
      flex-direction: column;
      text-align: center;
    }

    &__copyright {
      order: 2;
    }

    &__social-list {
      order: 1;
      justify-content: center;
    }
  }
}
</style>
