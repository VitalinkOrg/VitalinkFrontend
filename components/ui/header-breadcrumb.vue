<script lang="ts" setup>
interface Props {
  title: string;
}

defineProps<Props>();

const route = useRoute();

const formatSegmentLabel = (segment: string): string => {
  // Reemplazar guiones con espacios
  const words = segment.split("-");

  // Capitalizar cada palabra
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const generateBreadcrumbs = () => {
  const pathSegments = route.path.split("/").filter((segment) => segment);
  const breadcrumbs = [];

  let currentPath = "";

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    const isLast = i === pathSegments.length - 1;

    // Aplicar formato especial para ciertos segmentos
    let label = "";

    if (segment === "medicos" || segment === "socio-financiero") {
      label = "Inicio";
    } else {
      label = formatSegmentLabel(segment);
    }

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  return breadcrumbs;
};

const breadcrumbs = generateBreadcrumbs();
</script>

<template>
  <div class="page-header">
    <nav class="breadcrumb-nav" aria-label="breadcrumb">
      <ol class="breadcrumb-nav__list">
        <li
          v-for="(item, index) in breadcrumbs"
          :key="index"
          class="breadcrumb-nav__item"
          :class="{ 'breadcrumb-nav__item--active': !item.href }"
          :aria-current="!item.href ? 'page' : undefined"
        >
          <NuxtLink
            v-if="item.href"
            :href="item.href"
            class="breadcrumb-nav__link"
          >
            {{ item.label }}
          </NuxtLink>
          <span v-else>{{ item.label }}</span>
        </li>
      </ol>
    </nav>

    <div class="services-header">
      <p class="services-header__title">
        <span class="services-header__text">{{ title }}</span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 1rem;
  padding: 0 0.5rem;

  @include respond-to(sm) {
    padding: 0 1rem;
    margin-bottom: 1.25rem;
  }

  @include respond-to(md) {
    margin-bottom: 1.5rem;
  }
}

.breadcrumb-nav {
  --breadcrumb-divider: "/";
  margin-bottom: 0.375rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  @include respond-to(sm) {
    margin-bottom: 0.5rem;
  }

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }

  &__list {
    display: flex;
    flex-wrap: nowrap;
    padding: 0;
    margin: 0;
    list-style: none;
    min-width: min-content;

    @include respond-to(md) {
      flex-wrap: wrap;
    }
  }

  &__item {
    font-family: $font-family-main;
    font-size: 0.75rem;
    line-height: 1.125rem;
    white-space: nowrap;
    flex-shrink: 0;

    @include respond-to(sm) {
      font-size: 0.8125rem;
      line-height: 1.1875rem;
    }

    @include respond-to(md) {
      font-size: 0.875rem;
      line-height: 1.25rem;
      flex-shrink: 1;
      white-space: normal;
    }

    &:not(:last-child)::after {
      content: var(--breadcrumb-divider);
      margin: 0 0.25rem;
      color: $color-foreground;

      @include respond-to(sm) {
        margin: 0 0.3125rem 0 0.125rem;
      }

      @include respond-to(md) {
        margin: 0 0.375rem 0 0.1875rem;
      }
    }

    &--active {
      font-weight: 600;
      color: $color-foreground;
    }
  }

  &__link {
    @include link-base;
    color: $color-text-muted;

    &:hover {
      color: darken($color-text-muted, 10%);
      text-decoration: underline;
    }

    &:active {
      color: $color-foreground;
    }
  }
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  @include respond-to(md) {
    flex-wrap: nowrap;
    gap: 1rem;
  }

  &__title {
    margin: 0;
    flex: 1 1 auto;
    min-width: 0;
  }

  &__text {
    @include text-base;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.125rem;
    letter-spacing: 0;
    display: block;
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;

    @include respond-to(sm) {
      font-size: 1.125rem;
      line-height: 1.1875rem;
    }

    @include respond-to(md) {
      font-size: 1.25rem;
      line-height: 1.25rem;
    }

    @include respond-to(lg) {
      font-size: 1.375rem;
      line-height: 1.375rem;
    }
  }
}
</style>
