<template>
  <WebsiteNavbar v-if="!isAuthenticated" />
  <PacientesNav v-else="isAuthenticated" />
  <slot />
  <WebsiteFooter />
</template>
<style src="@/assets/styles/vitalink.scss" />

<script lang="ts" setup>
const { authenticated } = useAuthState();
const { getUserInfo } = useUserInfo();

const isAuthenticated = computed(() => {
  const userInfo = getUserInfo();

  return userInfo && authenticated.value;
});
</script>
