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
  if (panel.value === true) {
    return (panel.value = false);
  }

  // Mock data for offers
  offers.value = [
    {
      doctor_id: 1,
      hospital_name: "Clínica San José",
      review_score: 4.5,
      service: "Consulta General",
      price: 50,
      currency: "USD",
    },
    {
      doctor_id: 2,
      hospital_name: "Clínica San José",
      review_score: 4.7,
      service: "Ecografía",
      price: 70,
      currency: "USD",
    },
  ];

  panel.value = true;
};
</script>

<template>
  <NuxtLink
    :to="
      clinica.entity_type == 'doctor'
        ? `perfiles/doctor/${clinica.id}`
        : `perfiles/hospital/${clinica.id}`
    "
    style="text-decoration: none"
  >
    <div class="card shadow border-0 rounded-4 mb-4">
      <div class="card-body" style="cursor: pointer">
        <div class="row gap-2">
          <div class="col-md-3 d-flex justify-content-center d-md-block">
            <img
              src="@/src/assets/img-medico-thumbnail.png"
              class="img-fluid rounded-circle"
              alt="clinica"
              width="67.088px"
              height="66.975px"
            />
            <div class="bg-primary d-flex p-2 score justify-content-between gap-2">
              <p class="text-white mb-0">{{ parseFloat(clinica.review_score).toFixed(1) || "" }}</p>
              <img
                src="@/src/assets/star.svg"
                alt="Busca centro medico"
                class="img-fluid"
              />
            </div>
          </div>
          <div class="col">
            <h2 class="h5 fw-semibold my-2">{{ clinica.name }}</h2>
            <div class="d-flex align-items-center mt-3 mb-0 gap-2">
              <img
                src="@/src/assets/doctor-element.svg"
                alt="Busca centro medico"
                class="img-fluid"
              />
              <p class="text-muted mb-0">
                {{ clinica.specialty_name[0] || "Servicio no disponible" }}
              </p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <img
                src="@/src/assets/marker.svg"
                alt="Busca centro medico"
                class="img-fluid"
              />
              <p class="text-muted mb-0">
                +{{ clinica.hospital_count || 0 }} Hospitales diferentes
              </p>
            </div>
            <div class="mt-3 availability p-2">
              <p class="text-muted">Disponibilidad</p>
              <div class="d-flex align-items-center gap-2">
                <img
                  src="@/src/assets/calendar.svg"
                  alt="Busca centro medico"
                  class="img-fluid"
                />
                <p class="m-0">5 de Octubre, 2025</p>
              </div>
              <div class="d-flex align-items-center gap-2">
                <img
                  src="@/src/assets/clock.svg"
                  alt="Busca centro medico"
                  class="img-fluid"
                />
                <p class="m-0">11:00 am</p>
              </div>
            </div>
            <div class="mt-3">
              <span
                class="badge me-2 text-primary p-2"
                v-for="specialty in clinica.specialty_name"
                :key="specialty"
              >
                {{ specialty }}
              </span>
            </div>
            <div class="mt-3 d-flex justify-content-between align-items-center">
              <div>
                <p class="fw-bold mb-0">
                  {{ parseFloat(clinica.min_price).toLocaleString() }} USD
                </p>
                <p class="text-muted mb-0">Precio de referencia</p>
              </div>
              <a href="#" class="text-decoration-none"  @click.prevent="getOffers(clinica.entity_type, clinica.id)">
                Ver paquetes
                <img
                  src="@/src/assets/arrow-next.svg"
                  alt="Busca centro medico"
                  class="img-fluid"
                />
              </a>
            </div>
          </div>
        </div>
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
                    <small class="fw-semibold" v-if="offer.review_score">
                      {{ parseFloat(offer.review_score).toFixed(1) || "" }}
                    </small>
                    <AtomsIconsStar />
                    <small class="text-muted">(13 Reseñas)</small>
                  </p>
                  <p class="card-text text-center mb-0">
                    <small class="mb-0">Servicios</small>
                  </p>
                  <ul class="list-unstyled fw-light mx-auto mb-0 text--muted">
                    <li>
                      <small><Icon name="ph:virus" />{{ offer.service }}</small>
                    </li>
                  </ul>
                  <hr />
                  <p class="card-text text-center text-muted mb-0">
                    <small>Próxima Disponibilidad</small>
                  </p>
                  <p class="card-text text-center text-muted">
                    <small>5/10/2024 11:00 AM</small>
                  </p>
                  <div class="text-center bg-light rounded-3">
                    <span class="fw-semibold text-primary"
                      >Reembolso total</span
                    >
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
                  <button
                    @click="goTo(clinica.entity_type, clinica.id)"
                    class="btn btn-primary mt-2 rounded-3"
                  >
                    Pedir Cita
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
  <WebsiteReservarModal :isOpen="panel" :offers="offers" @close="panel = false" />
</template>
<style lang="scss" scoped>
  .card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .badge {
    font-size: 0.9rem;
    background-color: #ebecf7;
    border-radius: 105.022px;
  }

  .score {
    width: 62px;
    border-radius: 23px;
  }

  .availability {
    background-color: #f9f8f8;
    border-radius: 9px;
  }
</style>