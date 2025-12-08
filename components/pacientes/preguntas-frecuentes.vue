<template>
  <section class="faq" aria-labelledby="faq-title" id="faqs">
    <div class="faq__container">
      <div class="faq__content">
        <article
          v-for="item in faqItems"
          :key="item.id"
          class="faq__item"
          :class="{ 'faq__item--active': item.isOpen }"
        >
          <header class="faq__item-header">
            <h3 class="faq__item-question">{{ item.question }}</h3>
            <button
              class="faq__item-toggle"
              type="button"
              :aria-expanded="item.isOpen"
              :aria-controls="`faq-answer-${item.id}`"
              :aria-label="
                item.isOpen ? 'Cerrar pregunta' : 'Expandir pregunta'
              "
              @click="toggleFaq(item.id)"
            >
              <Transition name="icon-fade" mode="out-in">
                <AtomsIconsPlusIcon
                  v-if="!item.isOpen"
                  key="plus"
                  class="faq__item-icon faq__item-icon--plus"
                  size="24"
                  aria-hidden="true"
                />
                <AtomsIconsMinusIcon
                  v-else
                  key="close"
                  class="faq__item-icon faq__item-icon--close"
                  size="24"
                  aria-hidden="true"
                />
              </Transition>
            </button>
          </header>
          <Transition
            name="expand"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @leave="onLeave"
          >
            <div
              v-if="item.isOpen"
              :id="`faq-answer-${item.id}`"
              class="faq__item-body"
              role="region"
            >
              <div class="faq__item-body-content">
                <p v-if="!isArrayAnswer(item.answer)" class="faq__item-answer">
                  {{ item.answer }}
                </p>

                <template v-else>
                  <p
                    v-for="(paragraph, index) in item.answer"
                    :key="index"
                    class="faq__item-answer"
                  >
                    {{ paragraph }}
                  </p>
                </template>
              </div>
            </div>
          </Transition>
        </article>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";

interface FaqItem {
  id: number;
  question: string;
  answer: string | string[];
  isOpen: boolean;
}

const faqItems = ref<FaqItem[]>([
  {
    id: 1,
    question: "¿Cuáles son los tipos de cirugía disponibles en VitaLink?",
    answer: [
      "Cubrimos una amplia gama de procedimientos quirúrgicos, desde cirugía cardíaca hasta cirugía plástica. Simplemente ingresa el nombre del procedimiento en la barra de búsqueda para obtener resultados específicos.",
    ],
    isOpen: true,
  },
  {
    id: 2,
    question: "¿Puedo programar citas directamente a través de VitaLink?",
    answer:
      "Cubrimos una amplia gama de procedimientos quirúrgicos, desde cirugía cardíaca hasta cirugía plástica. Simplemente ingresa el nombre del procedimiento en la barra de búsqueda para obtener resultados específicos.",
    isOpen: false,
  },
  {
    id: 3,
    question: "¿Cómo protege VitaLink mi información personal y médica?",
    answer:
      "Cubrimos una amplia gama de procedimientos quirúrgicos, desde cirugía cardíaca hasta cirugía plástica. Simplemente ingresa el nombre del procedimiento en la barra de búsqueda para obtener resultados específicos.",
    isOpen: false,
  },
  {
    id: 4,
    question: "¿Qué hace diferente a VitaLink de otros directorios de salud?",
    answer:
      "Cubrimos una amplia gama de procedimientos quirúrgicos, desde cirugía cardíaca hasta cirugía plástica. Simplemente ingresa el nombre del procedimiento en la barra de búsqueda para obtener resultados específicos.",
    isOpen: false,
  },
]);

const toggleFaq = (id: number): void => {
  faqItems.value.forEach((faq) => {
    if (faq.id === id) {
      faq.isOpen = !faq.isOpen;
    } else {
      faq.isOpen = false;
    }
  });
};

const isArrayAnswer = (answer: string | string[]): answer is string[] => {
  return Array.isArray(answer);
};

const onEnter = (el: Element): void => {
  const element = el as HTMLElement;
  element.style.height = "0";
  element.style.opacity = "0";

  element.offsetHeight;

  element.style.height = element.scrollHeight + "px";
  element.style.opacity = "1";
};

const onAfterEnter = (el: Element): void => {
  const element = el as HTMLElement;
  element.style.height = "auto";
};

const onLeave = (el: Element): void => {
  const element = el as HTMLElement;
  element.style.height = element.scrollHeight + "px";

  element.offsetHeight;

  element.style.height = "0";
  element.style.opacity = "0";
};
</script>

<style lang="scss" scoped>
$color-foreground: #1a1a1a;
$color-text-secondary: #6b7280;
$primary-aqua: #0d9488;

@mixin respond-to($breakpoint) {
  @if $breakpoint == sm {
    @media (min-width: 640px) {
      @content;
    }
  } @else if $breakpoint == md {
    @media (min-width: 768px) {
      @content;
    }
  } @else if $breakpoint == lg {
    @media (min-width: 1024px) {
      @content;
    }
  }
}

@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: none;
  transition: all 0.2s ease;
}

.faq {
  padding: 3.125rem 1.25rem;

  @include respond-to(md) {
    padding: 3.125rem 2rem;
  }

  @include respond-to(lg) {
    padding: 3.125rem 0;
  }

  &__container {
    max-width: 78.125rem;
    margin: 0 auto;

    @include respond-to(lg) {
      gap: 4.375rem;
      align-items: start;
    }
  }

  &__title {
    font-weight: 700;
    font-size: 1.75rem;
    line-height: 125%;
    letter-spacing: 0;
    color: $color-foreground;
    margin: 0;

    @include respond-to(sm) {
      font-size: 2rem;
    }

    @include respond-to(md) {
      font-size: 2.625rem;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  &__item {
    max-width: 100%;
    border-radius: 6px;
    padding: 1.5rem;
    background: #f9f9f9;
    border: 0.0625rem solid $primary-aqua;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

    @include respond-to(sm) {
      padding: 1.875rem;
    }

    &:focus-within {
      box-shadow: 0 0 0 0.1875rem rgba($primary-aqua, 0.3);
    }

    &--active {
      box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
    }
  }

  &__item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  &__item-question {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 125%;
    letter-spacing: 0;
    color: #353e5c;
    margin: 0;
    flex: 1;
    padding-top: 0.25rem;

    @include respond-to(sm) {
      font-size: 1rem;
    }
  }

  &__item-toggle {
    @include button-base;
    padding: 0;
    min-width: 2.5rem;
    min-height: 2.5rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: transparent;

    &:hover {
      background: rgba(#353e5c, 0.1);
    }

    &:focus-visible {
      outline: 0.125rem solid #353e5c;
      outline-offset: 0.125rem;
      box-shadow: 0 0 0 0.1875rem rgba(#353e5c, 0.2);
    }
  }

  &__item-icon {
    color: #353e5c;
    display: block;
  }

  &__item-body {
    overflow: hidden;
    transition:
      height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__item-body-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1.25rem;

    @include respond-to(sm) {
      gap: 1.625rem;
      padding-top: 1.875rem;
    }
  }

  &__item-answer {
    font-weight: 500;
    font-size: 0.8125rem;
    line-height: 150%;
    letter-spacing: 0;
    color: $color-text-secondary;
    white-space: pre-line;
    margin: 0;

    @include respond-to(sm) {
      font-size: 0.875rem;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.15s ease;
}

.icon-fade-enter-from {
  opacity: 0;
}

.icon-fade-leave-to {
  opacity: 0;
}

.icon-fade-enter-to,
.icon-fade-leave-from {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .faq__item,
  .faq__item-body,
  .icon-fade-enter-active,
  .icon-fade-leave-active {
    transition: none;
  }
}
</style>
