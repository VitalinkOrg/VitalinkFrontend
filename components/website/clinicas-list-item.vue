<script setup>
import { defineProps, ref } from "vue";
const panel = ref(false);
const props = defineProps(["clinica"]);
const offers = ref([]);
const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();
const user_info = useCookie("user_info");

const searchProcedureCode = computed(() => route.query.procedure_code);
const searchSpecialtyCode = computed(() => route.query.specialty_code);

const token = useCookie("token");
const doctorData = ref(null);
const loadingPackages = ref(false);
const openPackagesModal = ref(false);

function goTo(type, id) {
  router.push({
    path: `perfiles/doctor/${id}`,
  });
}

const showPackages = async ({ medico }) => {
  openPackagesModal.value = true;
  try {
    loadingPackages.value = true;
    const { data } = await useLazyFetch(
      config.public.API_BASE_URL + "/supplier/get",
      {
        headers: { Authorization: token.value },
        params: { id: medico.id },
        transform: (_doctor) => _doctor.data,
      }
    );

    doctorData.value = data.value;
  } catch (error) {
    console.error("Error obteniendo datos del doctor", error);
  } finally {
    loadingPackages.value = false;
  }
};

const closePackagesModal = () => {
  openPackagesModal.value = false;
};
</script>

<template>
  <div class="clinic-section">
    <div class="clinic-list-grid">
      <WebsiteTarjetaMedico
        :medico="clinica"
        :queryParams="{
          procedure_code: searchProcedureCode,
          specialty_code: searchSpecialtyCode,
        }"
        @show-packages="showPackages"
      />
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

  <WebsitePackTratamientos
    :doctor="doctorData"
    :open="openPackagesModal"
    :procedure-code="procedureCode"
    :specialty-code="specialtyCode"
    :user-info="user_info"
    @close-modal="closePackagesModal"
  />
</template>

<style lang="scss" scoped>
.clinic-section {
  margin-top: 1rem;
}

.clinic-list-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @include respond-to(sm) {
    gap: 20px;
  }

  @include respond-to(md) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
  }

  @include respond-to(lg) {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }

  @include respond-to(xl) {
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  }
}

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
