<template>
  <MedicosRegistroOnboardingModalBienvenidaOnboarding
    ref="welcomeModalRef"
    @openProviderFormModal="handleOpenAddDoctorModal"
  />

  <MedicosModalesFormularioMedicoRelacionado
    ref="addDoctorModalRef"
    @doctor-added="handleDoctorAdded"
    @doctor-added-onboarding="handleDoctorAddedOnboarding"
  />

  <MedicosRegistroOnboardingModalFelicidadesCompletado ref="successModalRef" />
</template>

<script lang="ts" setup>
const welcomeModalRef = ref();
const addDoctorModalRef = ref();
const successModalRef = ref();

const handleOpenAddDoctorModal = () => {
  nextTick(() => {
    addDoctorModalRef.value?.openModal();
  });
};

const handleDoctorAdded = () => {
  console.log("✅ Médico agregado exitosamente");
};

const handleDoctorAddedOnboarding = () => {
  console.log("🎉 Onboarding completado - mostrando modal de felicidades");

  nextTick(() => {
    successModalRef.value?.handleOpenModal();
  });
};
</script>
