// components\website\base-dropdown.vue
<template>
  <div class="dropdown" ref="dropdownRef">
    <!-- Activador -->
    <button
      class="dropdown__toggle"
      type="button"
      :aria-expanded="isOpen.toString()"
      aria-haspopup="true"
      @click="toggle"
      @keydown.escape.prevent="close"
      ref="triggerRef"
    >
      <slot name="button" />
      <AtomsIconsChevronDown size="20" />
    </button>

    <!-- Menú -->
    <ul v-if="isOpen" class="dropdown__menu" role="menu" ref="menuRef">
      <slot name="menu" />
    </ul>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const isOpen = ref(false);
const dropdownRef = ref(null);
const triggerRef = ref(null);
const menuRef = ref(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      const firstItem = menuRef.value?.querySelector('[role="menuitem"]');
      firstItem?.focus?.();
    });
  }
};

const close = () => {
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (!dropdownRef.value?.contains(event.target)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

defineExpose({ close });
</script>

<style lang="scss">
.dropdown {
  position: relative;
  display: inline-block;
  &__toggle {
    @include outline-button;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #344054;
  }
}

.dropdown__menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  margin-top: 0.25rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  min-width: 200px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  padding: 0;
  overflow: hidden;
}

.dropdown__item {
  padding: 0;
  display: block;
  width: 100%;
  text-align: left;
  color: #333;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown__menu li {
  list-style: none;
}

.dropdown__menu a {
  display: block;
  color: #333;
  text-decoration: none;
}

.dropdown__menu a:hover,
.dropdown__menu a:focus {
  outline: none;
}
</style>
