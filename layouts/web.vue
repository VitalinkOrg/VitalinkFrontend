<template>
  <WebsiteNav v-if="!user_info" />
  <PacientesNav v-else="!user_info" />
  <slot />
  <WebsiteFooter />
</template>
<style src="@/assets/styles/vitalink.scss" />

<script setup>
const user_info = useCookie("user_info");
</script>
