<template>
  <section class="informative-content" id="specialties">
    <div class="informative-content__header">
      <span class="informative-content__header-badge">{{ headerBadge }}</span>
      <h2 class="informative-content__header-title">{{ headerTitle }}</h2>
    </div>

    <div class="informative-content__content">
      <div class="informative-content__actions">
        <button
          v-for="specialty in specialties"
          :key="specialty.id"
          @click="changeSpecialty(specialty.id)"
          :class="[
            'informative-content__toggle-button',
            activeSpecialty === specialty.id
              ? 'informative-content__toggle-button--primary'
              : 'informative-content__toggle-button--outline',
          ]"
          :aria-pressed="activeSpecialty === specialty.id"
          :aria-label="`Ver contenido de ${specialty.name}`"
        >
          <Icon :name="specialty.icon" />
          {{ specialty.name }}
        </button>
      </div>

      <div name="fade" class="informative-content__cards-wrapper" tag="div">
        <WebsiteCard
          v-for="card in activeCards"
          :key="`${activeSpecialty}-${card.id}`"
          :icon="card.icon"
          :title="card.title"
          :description="card.description"
          :modal-content="card.modalContent"
          :with-modal="true"
          :data="card"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Specialty } from "@/types";

const headerBadge = ref("Especialidades");
const headerTitle = ref("Contenido informativo");

const specialties = ref<Specialty[]>([
  {
    id: "oftalmologia",
    name: "Oftalmología",
    icon: "mdi:eye",
    cards: [
      {
        id: "cirugia-miopia",
        icon: "healthicons:eye",
        title: "Cirugía correctiva de miopía/astigmatismo",
        description:
          "¿Visión borrosa? ¿Dificultad para leer de lejos? Estos síntomas podrían indicar miopía o astigmatismo.",
        modalContent: {
          title: "Cirugía correctiva de miopía/astigmatismo",
          intro: {
            highlight: "¿Visión borrosa? ¿Dificultad para leer de lejos?",
            text: "Estos síntomas podrían indicar miopía o astigmatismo.",
          },
          procedureConsistOf: {
            text: " moldear la superficie del ojo con diversas técnicas como puede ser el uso de un láser especial para corregir problemas de enfoque como la miopía o el astigmatismo.",
            additionalText:
              "Se realiza de forma rápida, no requiere hospitalización y permite mejorar la visión sin depender de lentes o anteojos.",
          },
        },
      },
      {
        id: "cirugia-cataratas",
        icon: "healthicons:eye",
        title: "Cirugía de cataratas",
        description:
          "Vista nublada, halos al conducir o sensibilidad a la luz pueden ser señales de cataratas.",
        modalContent: {
          title: "Cirugía de cataratas",
          intro: { highlight: "Vista nublada", text: "Posible catarata." },
        },
      },
    ],
  },
  {
    id: "gastroenterologia",
    name: "Gastroenterología",
    icon: "healthicons:stomach",
    cards: [
      {
        id: "endoscopia",
        icon: "healthicons:stomach",
        title: "Endoscopia digestiva",
        description: "Explora el sistema digestivo superior.",
      },
      {
        id: "colonoscopia",
        icon: "healthicons:stomach",
        title: "Colonoscopia preventiva",
        description: "Previene cáncer colorrectal detectando pólipos.",
      },
    ],
  },
]);

const activeSpecialty = ref<string>(specialties.value[0]?.id || "");

const activeCards = computed(() => {
  const specialty = specialties.value.find(
    (s) => s.id === activeSpecialty.value
  );
  return specialty?.cards || [];
});

const changeSpecialty = (specialtyId: string) => {
  if (activeSpecialty.value === specialtyId) return;
  activeSpecialty.value = specialtyId;
};
</script>

<style lang="scss" scoped>
.informative-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.5rem 1rem;
  min-height: 39.438rem;

  @include respond-to(md) {
    gap: 2.5rem;
    padding: 3rem 2rem;
  }

  @include respond-to(lg) {
    gap: 2.5rem;
    padding: 3.125rem 0;
  }

  &__header {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;

    @include respond-to(md) {
      gap: 1.188rem;
    }
  }

  &__header-badge {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 125%;
    letter-spacing: 0;
    border-radius: 1.25rem;
    gap: 0.625rem;
    border-width: 0.063rem;
    padding: 0.5rem 0.75rem;
    color: #0cadbb;
    background: rgba(12, 173, 187, 0.1);
    border: 0.063rem solid rgba(12, 173, 187, 0.2);
    text-align: center;

    @include respond-to(md) {
      font-size: 1rem;
      padding: 0.625rem;
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
      font-size: 2.625rem;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @include respond-to(md) {
      gap: 1.875rem;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    gap: 0.75rem;
    width: 100%;

    @include respond-to(sm) {
      flex-direction: row;
      gap: 1rem;
    }

    @include respond-to(md) {
      gap: 1.313rem;
    }
  }

  &__toggle-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    box-sizing: border-box;
    border: 0.063rem solid transparent;
    padding: 0.875rem 1rem;
    border-radius: 1rem;
    min-height: 3rem;

    @include respond-to(sm) {
      width: auto;
    }

    &--primary {
      @include gradient-button;
      padding: 0.875rem 1rem;
      border-radius: 1rem;

      @include respond-to(md) {
        padding: 1rem;
        border-radius: 1.25rem;
      }
    }

    &--outline {
      @include outline-button;
      padding: 0.875rem 1rem;
      border-radius: 1rem;

      @include respond-to(md) {
        padding: 1rem;
        border-radius: 1.25rem;
      }
    }
  }

  &__cards-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 100%;
    margin: 0 auto;
    align-items: stretch;
    min-height: 31.25rem;
    overflow: hidden;

    @include respond-to(md) {
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      max-width: 49.438rem;
      min-height: 30rem;
    }

    @include respond-to(lg) {
      gap: 1.5rem;
      min-height: 18.75rem;
    }
  }
}
</style>
