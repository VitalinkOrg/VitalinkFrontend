<template>
  <div class="profile-tab">
    <div class="profile-section">
      <h5 class="profile-section__title">Descripción</h5>
      <p class="profile-section__content">{{ doctor.description }}</p>
    </div>

    <div class="profile-section" v-if="doctor.our_history">
      <h5 class="profile-section__title">Nuestra historia</h5>
      <p class="profile-section__content">{{ doctor.our_history }}</p>
    </div>

    <div class="profile-section" v-if="doctor.mission">
      <h5 class="profile-section__title">Misión</h5>
      <p class="profile-section__content">{{ doctor.mission }}</p>
    </div>

    <div class="profile-section" v-if="doctor.vision">
      <h5 class="profile-section__title">Visión</h5>
      <p class="profile-section__content">{{ doctor.vision }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  doctor: any;
}>();
</script>

<style lang="scss" scoped>
.profile-tab {
  padding: 20px 0px;

  .profile-section {
    &__title {
      @include label-base;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      color: #19213d;
    }

    &__content {
      @include label-base;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      color: #6d758f;
      padding: 15px;
    }
  }
}
</style>
