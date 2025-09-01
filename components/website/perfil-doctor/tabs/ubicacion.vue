<template>
  <div class="location-tab">
    <div class="location-tab__info">
      <p class="location-tab__title">Encuentranos Facilmente</p>
      <p class="location-tab__address">
        <span class="location-tab__icon">
          <AtomsIconsMapPointerIcon />
        </span>
        <span class="location-tab__address-text">
          {{ supplier?.address }}, {{ supplier?.city_name }},
          {{ supplier?.country_iso_code }}
        </span>
      </p>
      <div class="location-tab__contact">
        <a
          :href="`tel:${supplier?.phone_number}`"
          class="contact-button contact-button--phone"
        >
          <span><AtomsIconsPhoneIcon /></span>
        </a>
        <a
          :href="`mailto:${supplier?.email}`"
          class="contact-button contact-button--email"
        >
          <span><AtomsIconsMailIcon /></span>
        </a>
      </div>
    </div>
    <div class="location-tab__map">
      <AtomsMapaInteractivo
        :latitude="supplier?.latitude"
        :longitude="supplier?.longitude"
        :name="supplier?.name"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Supplier } from "~/types";

defineProps<{
  supplier: Supplier | Partial<Supplier> | null;
}>();
</script>

<style lang="scss" scoped>
.location-tab {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 2fr;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 28.5px;
    color: #19213d;
  }

  &__address {
    display: flex;
    align-items: center;
    gap: 17px;
  }

  &__icon {
    width: 15px;
    height: 15px;
    color: #0cadbb;
  }

  &__address-text {
    @include label-base;
    font-weight: 300;
    font-size: 16px;
    line-height: 21px;
    color: #6d758f;
  }

  &__contact {
    display: flex;
    gap: 15px;
  }

  .contact-button {
    @include button-base;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 9.04px 12.65px;
    gap: 18.08px;
    border-radius: 20px;
    background-color: #0cadbb;
    box-shadow: 0px 18.08px 28.92px 0px #14253f0f;
    box-shadow: 0px 0px 1.81px 0px #0c1a4b1a;
    color: #ffffff;

    svg {
      width: 30px;
      height: 30px;
    }
  }

  &__map {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 20px;
    overflow: hidden;
  }
}
</style>
