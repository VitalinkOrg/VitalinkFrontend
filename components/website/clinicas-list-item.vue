<script setup>
import { ref, defineProps } from "vue";
const panel = ref(false);
const props = defineProps(["clinica"]);
const offers = ref([]);
const config = useRuntimeConfig();
const router = useRouter();
function goTo(type, id) {
  if (type == "doctor") {
    router.push({
      path: `perfiles/doctor/${id}`,
    });
  } else {
    router.push({
      path: `perfiles/hospital/${id}`,
    });
  }
}
const getOffers = async (type, id) => {
  if(panel.value === true) {
    return panel.value = false;
  }
  let url;

  if (type === "doctor") {
    url =
      config.public.API_BASE_URL +
      `/patient_dashboard/offers_by_doctor?doctor_id=${id}`;
  } else {
    url =
      config.public.API_BASE_URL +
      `/patient_dashboard/offers_by_hospital?hospital_id=${id}`;
  }

  const { data, pending } = await useFetch(url);
  if (data.value) {
    panel.value = true;
    offers.value = data.value.data;
  }
};
</script>

<template>
  <div class="card shadow border-0 rounded-4 mb-4">
    <div class="card-body">
      <div class="row">
        <div
          class="col-sm-3"
          style="cursor: pointer"
          @click="goTo(clinica.entity_type, clinica.id)"
        >
          <!-- <img
            v-if="clinica.picture"
            :src="clinica.picture"
            class="img-fluid rounded-4"
            alt="clinica"
          /> -->
          <img
            src="@/src/assets/img-clinica-thumbnail.png"
            class="img-fluid rounded-4"
            alt="clinica"
          />
        </div>
        <div class="col">
          <small>
            <span class="fw-semibold me-2" v-if="clinica.review_score">
              <!-- {{ clinica.price || "" }} -->
              {{ parseFloat(clinica.review_score).toFixed(1) || "" }}
              <AtomsIconsStar />
            </span>
            <!-- <span class="text-muted">({{ clinica.rating.reviews || 0 }} Reseñas)</span> -->
            <span class="text-muted"
              >({{ clinica.review_count || 0 }} Reseñas)</span
            >
          </small>
          <h2 class="h5 fw-semibold my-2">{{ clinica.name }}</h2>
          <span
            class="badge bg-primary text-primary me-2 rounded-5 text-capitalize p-2"
            style="--bs-bg-opacity: 0.07"
            v-for="specialty in clinica.specialty_name"
            :key="specialty.length"
            >{{ specialty }}</span
          >
          <div class="d-flex my-3" v-if="clinica.service_name">
            <span
              class="badge rounded-circle bg-primary text-primary me-2"
              style="--bs-bg-opacity: 0.05"
              >I</span
            >
            <p class="fw-light text-muted mb-0">
              {{ clinica.service_name[0] }}
            </p>
            <!-- <p
              class="fw-light text-muted mb-0"
              v-for="service in clinica.service_name"
              :key="service.length"
            >
              {{ service }}
            </p> -->
          </div>
          <p class="fw-light text-muted">
            <span
              class="badge rounded-circle bg-primary text-primary me-2"
              style="--bs-bg-opacity: 0.05"
              >I</span
            >+5 Hospitales diferentes
          </p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="card bg-light rounded-4 border-0">
              <div class="card-body py-2">
                <span class="text-muted">Disponibilidad:</span><br />
                <span class="fw-normal"
                  >[I] 5 de Octubre de 2023 [I] 11:00 am</span
                >
              </div>
            </div>
            <div
              class="d-flex flex-column align-items-end btn btn-light bg-white"
              @click="getOffers(clinica.entity_type, clinica.id)"
            >
              <span class="text-muted">A partir de</span>
              <span class="fw-bold text-nowrap"
                >{{ parseFloat(clinica.min_price).toLocaleString() }} USD
                A</span
              >
            </div>
          </div>
        </div>
      </div>
      <div v-if="pending">Loading offers...</div>
      <div v-if="panel" class="my-4">
        <p class="text-center text-primary h6 fw-medium fs-4">
          Compara las ofertas
        </p>
        <div class="row row-cols-1 row-cols-sm-3 g-4">
          <div class="col" v-for="offer in offers" :key="offer.doctor_id">
            <div class="card rounded-4">
              <div class="card-header bg-primary text-light rounded-top-4">
                <h5 class="card-title fw-medium h6 text-center pt-2">
                  {{ clinica.hospital_name || clinica.name }}
                </h5>
              </div>
              <div class="card-body d-flex flex-column">
                <p class="card-text text-center">
                  <small class="fw-semibold">
                    {{ parseFloat(offer.review_score).toFixed(1) || "" }}
                  </small>
                  <AtomsIconsStar />
                  <small class="text-muted">(13 Reseñas)</small>
                </p>
                <p class="card-text text-center mb-0">
                  <small class="mb-0">Servicios</small>
                </p>
                <ul class="list-unstyled fw-light mx-auto mb-0 text--muted">
                  <li><small>[I]{{ offer.service }}</small></li>
                  <!-- <li><small>[I]Sala de cirugía</small></li>
                  <li><small>[I]Habitación privada</small></li> -->
                </ul>
                <hr />
                <p class="card-text text-center text-muted">
                  <small>Próxima Disponibilidad</small>
                  <small>[I] 5/10/2024 11:00 AM</small>
                </p>
                <div class="text-center bg-light rounded-3">
                  <span class="fw-semibold text-primary">Reembolso total</span>
                  <br />
                  <small class="text-muted"
                    >Precio original
                    <span class="text-decoration-line-through"
                      >{{ parseFloat(offer.price).toLocaleString() }}
                      {{ offer.currency }}
                    </span></small
                  ><br />
                  <small class="fw-medium">Con Váucher:</small> <br />
                  <button class="btn btn-outline-success btn-sm rounded-4">
                    AG5228GE6
                  </button>
                </div>
                <NuxtLink
                  href="/perfiles/clinica-biblica"
                  class="btn btn-primary mt-2 rounded-3"
                  >Pedir Cita
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
