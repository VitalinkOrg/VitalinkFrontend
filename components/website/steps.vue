<template>
  <section class="steps" id="how-does-it-work">
    <div class="steps__header">
      <span class="steps__header-badge">¿Cómo funciona?</span>
      <h2 class="steps__header-title">Paso a paso</h2>
    </div>

    <div class="steps__content">
      <div class="steps__side-images-wrapper">
        <img
          class="steps__side-image steps__side-image--top-left"
          :src="images.topLeft"
          alt="Doctor realizando chequeo médico de rutina"
        />
        <img
          class="steps__side-image steps__side-image--bottom-right"
          :src="images.bottomRight"
          alt="Médico anotando los síntomas de un paciente"
        />
      </div>

      <div class="steps__wrapper">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          ref="stepCards"
          class="steps__card"
          :class="{ 'steps__card--visible': visibleSteps.includes(index) }"
        >
          <div class="steps__card-number-wrapper">
            <span class="steps__card-number">{{ index + 1 }}</span>
          </div>
          <div class="steps__card-content">
            <div class="steps__card-icon">
              <Icon :name="step.icon" size="25" />
            </div>
            <h3 class="steps__card-text">{{ step.title }}</h3>
            <div class="steps__card-description">
              <p v-for="(paragraph, pIndex) in step.description" :key="pIndex">
                {{ paragraph }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import doctorCheckupImage from "@/src/assets/doctor-realizando-chequeo-medico-de-rutina.png";
import doctorNotesImage from "@/src/assets/medico-anotando-los-sintomas-de-un-paciente.png";
import { onMounted, onUnmounted, ref } from "vue";

interface Step {
  id: number;
  title: string;
  description: string[];
  icon: string;
}

const images = {
  topLeft: doctorCheckupImage,
  bottomRight: doctorNotesImage,
};

const steps: Step[] = [
  {
    id: 1,
    title: "Busca y compara",
    description: [
      "Encuentra el procedimiento o especialista que necesitas, compara precios y elige la mejor opción para ti.",
    ],
    icon: "lucide:search",
  },
  {
    id: 2,
    title: "Agenda tu cita de valoración",
    description: [
      "Coordina una cita con el profesional de la salud para confirmar que eres candidato al procedimiento.",
    ],
    icon: "mynaui:calendar",
  },
  {
    id: 3,
    title: "Recibe tu proforma",
    description: [
      "El especialista te entrega el precio final y todos los detalles del procedimiento.",
    ],
    icon: "lucide:file-text",
  },
  {
    id: 4,
    title: "Elige cómo pagar",
    description: [
      "Decide si lo haces con tus recursos o solicitas financiamiento. Si tu solicitud es aprobada, continúa con la reserva.",
      "Podes solicitar financiamiento para vos o tus familiares. Te recomendamos primero consultar con tu Asociación solidarista.",
    ],
    icon: "solar:dollar-broken",
  },
  {
    id: 5,
    title: "Reserva y asiste a tu procedimiento",
    description: [
      "Agenda de forma segura, preséntate en la fecha acordada y realiza el pago.",
    ],
    icon: "lucide:shield-check",
  },
];

const stepCards = ref<HTMLElement[]>([]);
const visibleSteps = ref<number[]>([]);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = stepCards.value.indexOf(entry.target as HTMLElement);
          if (index !== -1 && !visibleSteps.value.includes(index)) {
            visibleSteps.value.push(index);
          }
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  stepCards.value.forEach((card) => {
    if (card) {
      observer?.observe(card);
    }
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.steps {
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
    color: #3541b4;
    background: rgba(53, 65, 180, 0.1);
    border: 1px solid rgba(53, 65, 180, 0.2);
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
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @include respond-to(lg) {
      grid-template-columns: 1fr 1fr;
      gap: 52px;
    }
  }

  &__side-images-wrapper {
    display: none;

    @include respond-to(lg) {
      display: flex;
      position: relative;
      height: 636px;
      align-self: center;
    }
  }

  &__side-image {
    position: absolute;
    width: 100%;
    max-width: 494px;
    height: auto;
    aspect-ratio: 494 / 441;
    border-radius: 36px;
    background-color: $white;

    &--top-left {
      top: 0;
      left: 0;
      z-index: 10;
    }

    &--bottom-right {
      bottom: 0;
      right: 0;
      z-index: 1;
    }
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    @include respond-to(md) {
      gap: 2.5rem;
    }

    @include respond-to(lg) {
      gap: 46px;
    }
  }

  &__card {
    display: flex;
    width: 100%;
    border-left: 4px solid #3541b4;
    opacity: 0.4;
    transform: translateX(-20px);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);

    @include respond-to(md) {
      border-left: 6px solid #3541b4;
    }

    &--visible {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &__card-number-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 0 12px;

    @include respond-to(md) {
      padding: 0 18px;
    }
  }

  &__card-number {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    font-weight: 700;
    font-size: 24px;
    line-height: 125%;
    letter-spacing: 0;
    color: #3541b4;
    padding: 8px;
    border: 1px solid rgba(53, 65, 180, 0.2);
    background: rgba(53, 65, 180, 0.1);
    border-radius: 50%;

    @include respond-to(md) {
      width: 42px;
      height: 42px;
      font-size: 32px;
      padding: 10px;
    }
  }

  &__card-content {
    flex: 1;
  }

  &__card-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: 11px;
    padding: 6px 8px;
    background: #3541b4;
    color: $white;
    box-shadow:
      0px 14.85px 23.76px 0px rgba(20, 37, 63, 0.06),
      0px 0px 1.48px 0px rgba(12, 26, 75, 0.1);
    margin-bottom: 12px;

    @include respond-to(md) {
      width: 40px;
      height: 40px;
      padding: 7.42px 10.39px;
      margin-bottom: 14px;
    }
  }

  &__card-text {
    font-weight: 700;
    font-size: 16px;
    line-height: 125%;
    letter-spacing: 0;
    color: #19213d;
    margin-bottom: 0.5rem;

    @include respond-to(md) {
      font-size: 18px;
    }
  }

  &__card-description {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include respond-to(md) {
      gap: 24px;
    }

    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 125%;
      letter-spacing: 0;
      color: #6d758f;
      margin: 0;

      @include respond-to(md) {
        font-size: 16px;
      }
    }
  }
}
</style>
