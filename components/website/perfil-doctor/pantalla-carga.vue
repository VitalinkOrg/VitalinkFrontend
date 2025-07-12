<template>
  <div class="loading-container">
    <div class="loading-wrapper">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="loading-content">
        <h3 class="loading-title">Cargando perfil médico</h3>
        <p class="loading-description">Obteniendo información del doctor...</p>
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
  padding: 2rem;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow: 0px 20px 24px 0px #14253f0f;
  box-shadow: 0px 0px 1px 0px #0c1a4b1a;
  min-width: 320px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;

  &:nth-child(1) {
    border-top-color: #3541b4;
    animation: spin 1.5s linear infinite;
  }

  &:nth-child(2) {
    border-top-color: #0cadbb;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-content {
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
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
  font-size: 1.5rem;
  font-weight: 600;
  color: #19213d;
  margin-bottom: 0.5rem;
  font-family: inherit;
}

.loading-description {
  font-size: 1rem;
  color: #6d758f;
  margin: 0;
  font-weight: 400;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .loading-wrapper {
    padding: 2rem 1.5rem;
    min-width: 280px;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
  }

  .loading-title {
    font-size: 1.25rem;
  }

  .loading-description {
    font-size: 0.9rem;
  }
}
</style>
