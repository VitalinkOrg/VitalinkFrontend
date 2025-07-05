<template>
  <header class="register-header">
    <h2 class="register-header__title">Registrarse</h2>
    <span class="register-header__description">Es gratis y fácil</span>
  </header>
</template>

<style lang="scss" scoped>
.register-header {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  &__title {
    font-family: $font-family-main;
    font-weight: 700;
    font-size: 29.41px;
    line-height: 136%;
    letter-spacing: 0;
    color: $color-primary;
  }

  &__description {
    font-family: $font-family-montserrat-alt;
    font-weight: 500;
    font-size: 16px;
    line-height: 162%;
    letter-spacing: 0;
    text-align: center;
    color: $color-primary;
  }
}
</style>
