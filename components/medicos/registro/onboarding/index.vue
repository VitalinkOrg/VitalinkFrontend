<template>
  <MedicosRegistroOnboardingModalBienvenidaOnboarding
    ref="welcomeModalRef"
    @openProviderFormModal="openProviderFormModal"
  />
  <MedicosRegistroOnboardingModalFormularioProveedor
    ref="providerFormModalRef"
    @openWelcomeModal="openWelcomeModal"
    @openSuccessModal="openSuccessModal"
    @closeWelcomeModal="closeWelcomeModal"
  />
  <MedicosRegistroOnboardingModalFelicidadesCompletado ref="successModalRef" />
</template>

<script lang="ts" setup>
const welcomeModalRef = ref();
const providerFormModalRef = ref();
const successModalRef = ref();

const openSuccessModal = () => {
  successModalRef.value?.handleOpenModal();
};

const openProviderFormModal = () => {
  providerFormModalRef.value?.handleOpenModal();
};

const openWelcomeModal = () => {
  welcomeModalRef.value?.handleOpenModal();
};

const closeWelcomeModal = () => {
  welcomeModalRef.value?.handleCloseModal();
};
</script>
