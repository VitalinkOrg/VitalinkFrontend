<template>
  <div
    class="loading-container"
    role="status"
    aria-live="polite"
    aria-label="Cargando datos del panel médico"
  >
    <div class="loading-wrapper">
      <div class="loading-spinner" aria-hidden="true">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="loading-content">
        <p class="loading-title">Cargando datos</p>
        <p class="loading-description">Obteniendo información...</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  width: 100%;
  background-color: #f8f8f8;
  padding: $spacing-xl;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: $white;
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow:
    0px 20px 24px 0px #14253f0f,
    0px 0px 1px 0px #0c1a4b1a;
  min-width: 320px;

  @include respond-to-max(sm) {
    padding: $spacing-xl $spacing-lg;
    min-width: 280px;
  }
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: $spacing-lg;

  @include respond-to-max(sm) {
    width: 60px;
    height: 60px;
  }
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;

  @media (prefers-reduced-motion: no-preference) {
    &:nth-child(1) {
      border-top-color: $color-primary;
      animation: spin 1.5s linear infinite;
    }

    &:nth-child(2) {
      border-top-color: $primary-aqua;
      animation: spin 1.5s linear infinite;
      animation-delay: -0.5s;
      width: 60px;
      height: 60px;
      top: 10px;
      left: 10px;
    }

    &:nth-child(3) {
      border-top-color: #ebecf7;
      animation: spin 1.5s linear infinite;
      animation-delay: -1s;
      width: 40px;
      height: 40px;
      top: 20px;
      left: 20px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &:nth-child(1) {
      border-top-color: $color-primary;
    }

    &:nth-child(2) {
      border-top-color: $primary-aqua;
      width: 60px;
      height: 60px;
      top: 10px;
      left: 10px;
    }

    &:nth-child(3) {
      border-top-color: #ebecf7;
      width: 40px;
      height: 40px;
      top: 20px;
      left: 20px;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-content {
  text-align: center;

  @media (prefers-reduced-motion: no-preference) {
    animation: fadeInUp 0.8s ease-out;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-title {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  color: $color-foreground;
  margin: 0 0 $spacing-sm;
  font-family: $font-family-main;
}

.loading-description {
  font-size: 1rem;
  color: $color-text-secondary;
  margin: 0;
  font-weight: 400;

  @include respond-to-max(sm) {
    font-size: 0.9rem;
  }
}
</style>
