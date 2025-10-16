<template>
  <div class="featured__card">
    <div class="featured__card-wrapper">
      <div class="featured__card-icon">
        <slot name="icon">
          <Icon :name="icon" size="25" />
        </slot>
      </div>
      <h3 class="featured__card-text">
        {{ title }}
      </h3>
      <p class="featured__card-description">
        {{ description }}
      </p>
      <WebsiteModalEspecialidad v-if="withModal" :data="data" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardData } from "~/types";

interface Props {
  icon: string;
  title: string;
  description: string;
  withModal?: boolean;
  data: CardData;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.featured__card {
  background: $white;
  border-radius: 1.25rem;
  box-shadow: 0 0.25rem 1.306rem 0 rgba(12, 173, 187, 0.1);
  padding: 0.625rem;
}

.featured__card-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 11.25rem;
  height: 100%;
  border-radius: 0.75rem;
  border: 0.063rem solid #c2ebee;
  padding: 1.25rem 1rem;

  @include respond-to(md) {
    min-height: 12.875rem;
    padding: 1.75rem 1.25rem;
  }
}

.featured__card-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.688rem;
  padding: 0.464rem 0.649rem;
  gap: 0.928rem;
  color: $white;
  background-color: #0cadbb;
  box-shadow:
    0 0.928rem 1.485rem 0 rgba(20, 37, 63, 0.06),
    0 0 0.093rem 0 rgba(12, 26, 75, 0.1);
  margin-bottom: 1rem;

  @include respond-to(md) {
    margin-bottom: 1.188rem;
  }
}

.featured__card-text {
  font-weight: 700;
  font-style: Bold;
  font-size: 1rem;
  line-height: 125%;
  letter-spacing: 0;
  color: #19213d;

  @include respond-to(md) {
    font-size: 1.125rem;
  }
}

.featured__card-description {
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 125%;
  letter-spacing: 0;
  color: #6d758f;

  @include respond-to(md) {
    font-size: 1rem;
  }
}
</style>
