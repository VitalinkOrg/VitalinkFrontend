<script lang="ts" setup>
interface Props {
  alt?: string;
}

withDefaults(defineProps<Props>(), {
  alt: "",
});
</script>

<template>
  <img src="@/assets/img-icon-no-activity.svg" :alt="alt" />
</template>
