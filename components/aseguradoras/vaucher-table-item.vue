<script>
export default {
  props: ['vaucher'],
  data: () => ({
    open: false
  })
}
</script>
<template>
  <tr>
    <td><span class="badge text-dark border border-dark rounded-5 w-100">{{ vaucher.id }}</span></td>
    <td>{{ vaucher.asegurado.nombre }} {{ vaucher.asegurado.apellidos }}</td>
    <td>{{ vaucher.asegurado.id }}</td>
    <td>{{ vaucher.servicio }}</td>
    <td>{{ vaucher.vencimiento }}</td>
    <td><span class="badge bg-success-subtle rounded-5 text-dark">{{ vaucher.estado }} </span></td>
    <td>
      <button @click="open = !open" class="btn btn-sm ">
        <AtomsIconsDownloadIcon />
      </button>
    </td>
  </tr>
  <tr v-if="open">
    <td colspan="7">Hey</td>
  </tr>
</template>