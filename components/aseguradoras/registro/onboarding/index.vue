<template>
  <AseguradorasRegistroOnboardingModalBienvenida
    ref="welcomeModalRef"
    @openExploreModal="openExploreModal"
  />
  <AseguradorasRegistroOnboardingModalExplorar
    ref="exploreModalRef"
    @openWelcomeModal="openWelcomeModal"
    @openSuccessModal="openSuccessModal"
    @closeWelcomeModal="closeWelcomeModal"
  />
  <AseguradorasRegistroOnboardingModalEmpezar ref="successModalRef" />
</template>

<script lang="ts" setup>
const welcomeModalRef = ref();
const exploreModalRef = ref();
const successModalRef = ref();

const openSuccessModal = () => {
  successModalRef.value?.handleOpenModal();
};

const openExploreModal = () => {
  exploreModalRef.value?.handleOpenModal();
};

const openWelcomeModal = () => {
  welcomeModalRef.value?.handleOpenModal();
};

const closeWelcomeModal = () => {
  welcomeModalRef.value?.handleCloseModal();
};
</script>
