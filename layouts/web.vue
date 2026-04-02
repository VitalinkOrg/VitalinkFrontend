<template>
  <WebsiteNavbar v-if="!isAuthenticated" />
  <PacientesNav v-else />
  <slot />
  <UiNotificationToast />
  <WebsiteFooter />
</template>
<style src="@/assets/styles/vitalink.scss" />

<script lang="ts" setup>
const { authenticated } = useAuthState();

const isAuthenticated = computed(() => authenticated.value);
</script>
