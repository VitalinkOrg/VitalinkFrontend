<script>
export default {
  props: ['servicio'],
}
</script>

<template>
  <span class="badge bg-primary text-primary me-2 rounded-5 text-capitalize" style="--bs-bg-opacity: .07">
    {{
      servicio.nombre
    }}
  </span>
</template>