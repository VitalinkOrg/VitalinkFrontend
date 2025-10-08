<script lang="ts" setup>
interface Props {
  title: string;
}

defineProps<Props>();

const route = useRoute();

const generateBreadcrumbs = () => {
  const pathSegments = route.path.split("/").filter((segment) => segment);
  const breadcrumbs = [];

  let currentPath = "";

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    const isLast = i === pathSegments.length - 1;
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    if (segment === "medicos") {
      label = "Inicio";
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
  margin-bottom: 1.5rem;
}

.breadcrumb-nav {
  --breadcrumb-divider: "/";
  margin-bottom: 0.5rem;

  &__list {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__item {
    font-family: $font-family-main;
    font-size: 0.875rem;
    line-height: 1.25rem;

    &:not(:last-child)::after {
      content: var(--breadcrumb-divider);
      margin: 0 0.375rem 0 0.1875rem;
      color: #353e5c;
    }

    &--active {
      font-weight: 600;
      color: #353e5c;
    }
  }

  &__link {
    color: #6c757d;
    text-decoration: none;

    &:hover {
      color: #495057;
      text-decoration: underline;
    }
  }
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__title {
    margin: 0;
  }

  &__text {
    @include text-base;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.25rem;
    letter-spacing: 0;
  }
}
</style>
