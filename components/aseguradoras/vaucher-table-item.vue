<script>
export default {
  props: ["voucher", "selectable"],
  data: () => ({
    open: false,
  }),
};
</script>
<template>
  <tr>
    <td v-if="selectable">
      <div class="form-check">
        <input
          class="form-check-input border-dark"
          type="checkbox"
          value=""
          :id="voucher.voucher_id"
        />
        <!-- <label class="form-check-label" for="flexCheckDefault"></label> -->
      </div>
    </td>
    <td>
      <span class="badge text-dark border border-dark rounded-5 w-100">{{
        voucher.code
      }}</span>
    </td>
    <td>{{ voucher.patient_name }}</td>
    <td>{{ voucher.insurance_number }}</td>
    <td>{{ voucher.reason_for_request }}</td>
    <td>{{ new Date(voucher.due_date).toLocaleDateString() }}</td>
    <td>
      <span class="badge bg-success-subtle rounded-5 text-dark"
        >{{ voucher.status }}
      </span>
    </td>
    <td>
      <button @click="open = !open" class="btn btn-sm">
        <AtomsIconsChevronDown />
      </button>
    </td>
  </tr>
  <tr v-if="open" class="shadow mb-3 rounded-4">
    <td colspan="8" class="px-4">
      <span class="row">
        <span class="col-3">
          <dl class="d-flex mb-0">
            <dt class="fw-normal me-1 text-nowrap">Dirección:</dt>
            <dd>{{ voucher.address }}</dd>
          </dl>
          <dl class="d-flex mb-0">
            <dt class="fw-normal me-1 text-nowrap">Número de Teléfono:</dt>
            <dd>{{ voucher.phone_number }}</dd>
          </dl>
          <dl class="mb-0">
            <dt class="fw-normal me-1 text-nowrap">Dirección Física:</dt>
            <dd>
              {{
                voucher.address +
                ", " +
                voucher.city +
                ", " +
                voucher.postal_code
              }}
            </dd>
          </dl>
        </span>
        <span class="col">
          <dl class="d-flex mb-0">
            <dt class="fw-normal me-1 text-nowrap">Proveedor del Servicio:</dt>
            <dd>Hospital CIMA</dd>
          </dl>
          <dl class="d-flex mb-0">
            <dt class="fw-normal me-1 text-nowrap">Costos y Facturación:</dt>
            <dd>23.000 USD</dd>
          </dl>
          <dl class="d-flex mb-0">
            <dt class="fw-normal me-1 text-nowrap">Número de teléfono:</dt>
            <dd>+506 7123-4567</dd>
          </dl>
          <dl class="mb-0">
            <dt class="fw-normal me-1 text-nowrap">Dirección Física:</dt>
            <dd>
              San José, Autop. Próspero Fernández, San José, San Rafael, Costa
              Rica, CR-1000
            </dd>
          </dl>
        </span>
        <span class="col">
          <span class="form-label">Mensaje del asegurado</span>
          <span
            class="d-block p-2 bg-primary rounded-4 fw-light border"
            style="--bs-bg-opacity: 0.05"
            >Solicito un voucher para cubrir la operación de cataratas en ambos
            ojos, recomendada por mi oftalmólogo para mejorar mi visión. Esta
            intervención es esencial para mi calidad de vida, y agradecería
            mucho su apoyo en este asunto.</span
          >
        </span>
      </span>
      <span class="row">
        <span class="col">
          <span
            class="d-block p-2 bg-primary rounded-4 fw-light border"
            style="--bs-bg-opacity: 0.05"
          >
            <span class="fw-normal mb-1 d-block">
              <AtomsIconsChatIcon /> Comentarios
            </span>
            <span class="bg-light d-block p-2">
              {{ voucher.comment_by_insurance }}
            </span>
            <span class="text-end d-block"
              ><strong class="fw-medium">Tomás Clark</strong>
              <span class="text-muted">28 de Septiembre</span></span
            >
          </span>
          <span class="text-end d-block pt-3 pb-2">
            <button class="btn btn-light border-dark fw-normal me-3">
              Ver Seguimiento de Reclamaciones
            </button>
            <button class="btn btn-info text-white fw-normal me-3">
              Agregar Comentarios o Notas
            </button>
            <button class="btn btn-info text-white fw-normal">
              <AtomsIconsDownloadIcon />
            </button>
          </span>
        </span>
      </span>
    </td>
  </tr>
</template>
