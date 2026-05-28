<template>
  <Icon name="material-symbols:mail-outline" :size="size" />
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ size?: string | number }>(), { size: 24 });
</script>
