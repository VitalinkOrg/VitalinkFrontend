
<script>
export default {
  data: () => ({
    open: false
  })
}
</script>
<template>
  <div class="accordion-item border-bottom border-warning w-100">
    <h2 class="accordion-header py-3">
      <button class="accordion-button d-flex justify-content-between" type="button" @click="open = !open">
        Lorem ipsum dolor sit amet, consectetur cdolor <span>Arrow</span>
      </button>
    </h2>
    <div class="accordion-collapse" v-if="open">
      <div class="accordion-body pb-3">
        <small>Lorem ipsum dolor sit amet, consectetur cdolor col adipiscing elit. Integer mattis
          nunc
          augue vel lacinia erat euismod ut. Sed eleifend tellus nonole tincidunt aliquet. Fusce aliquam mi felis.</small>
      </div>
    </div>
  </div>
</template>