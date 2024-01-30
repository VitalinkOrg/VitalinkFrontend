<script setup>
const { vauchers, getVauchers } = usePaciente()
</script>
<template>
  <div class="card">
    <table class="table fw-light">
      <thead>
        <tr>
          <th scope="col" class="text-muted">Nombre del paciente</th>
          <th scope="col" class="text-muted">Doctor</th>
          <th scope="col" class="text-muted">Fecha</th>
          <th scope="col" class="text-muted">Hora</th>
          <th scope="col" class="text-muted">Procedimiento</th>
          <th scope="col" class="text-muted">Lugar</th>
          <th scope="col" class="text-muted">Estado</th>
          <th scope="col" class="text-muted"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="cita in citas">
          <td>{{ cita.paciente }}</td>
          <td>{{ cita.medico.nombre }}</td>
          <td>{{ cita.fecha }}</td>
          <td>{{ cita.hora }}</td>
          <td>{{ cita.procedimiento }}</td>
          <td><small>{{ cita.lugar.texto }}</small></td>
          <td><span class="badge bg-success-subtle rounded-5 text-dark">{{ cita.estado }} [I]</span></td>
        </tr>
      </tbody>
    </table>

    <div class="card-footer bg-transparent justify-content-end d-flex">
      <nav>
        <ul class="pagination m-0">
          <li class="page-item">
            <button class="page-link border-0 text-nowrap" @click="getCitas()" aria-label="Previous">
              <span aria-hidden="true">&laquo; Anterior</span>
            </button>
          </li>
          <li class="page-item"><button class="page-link border-0 shadow-sm mx-1  bg-light" @click="getCitas()">1</button>
          </li>
          <li class="page-item"><button class="page-link border-0 shadow-sm mx-1  bg-light" @click="getCitas()">2</button>
          </li>
          <li class="page-item"><button class="page-link border-0 shadow-sm mx-1  bg-light" @click="getCitas()">3</button>
          </li>
          <li class="page-item">
            <button class="page-link border-0 text-nowrap" @click="getCitas()" aria-label="Next">
              <span aria-hidden="true">Siguiente &raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>