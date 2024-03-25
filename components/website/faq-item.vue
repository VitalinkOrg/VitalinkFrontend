
<script>
export default {
  props: {
    title: {
      type: String,
      default: '¿Cuáles son los tipos de cirugía disponibles en VitaLink?',
    },
    subtitles: {
      type: String,
      default: 'Cubrimos una amplia gama de procedimientos quirúrgicos, desde cirugía cardíaca hasta cirugía plástica. Simplemente ingresa el nombre del procedimiento en la barra de búsqueda para obtener resultados específicos.'
    }
  },
  data: () => ({
    open: false
  })
}
</script>
<template>
  <div class="accordion-item border-bottom border-warning w-100">
    <h3 class="accordion-header py-3 d-flex">
      <button class="accordion-button d-flex justify-content-between" type="button" @click="open = !open">
        {{ title }}
      </button>
      <Icon name="material-symbols:expand-more" />
    </h3>
    <div class="accordion-collapse" v-if="open">
      <div class="accordion-body pb-3">
        <small>Cubrimos una amplia gama de procedimientos quirúrgicos, desde cirugía cardíaca hasta cirugía plástica. Simplemente ingresa el nombre del procedimiento en la barra de búsqueda para obtener resultados específicos.</small>
      </div>
    </div>
  </div>
</template>