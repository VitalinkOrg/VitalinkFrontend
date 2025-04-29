<script setup>
/*definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});*/
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");
const user = user_info.value;
const firstName = ref(user.first_name || user.name);
const lastName = ref(user.last_name);
const phoneNumber = ref(user.phone_number || user.phone_number_1);
const address = ref(user.address);
const city = ref(user.city);
const country_iso_code = ref(user.country_iso_code);
const postal_code = ref(user.postal_code);

// Enhanced mock data with more details and variety
const doctorReviews = [
  {
    id: 1,
    first_name: "María",
    last_name: "González",
    message:
      "El doctor fue muy profesional y la clínica estaba impecable. La recuperación fue más rápida de lo esperado.",
    pacient_type: "Paciente de Cirugía de Cataratas",
    score: 5,
    date: "2023-10-15",
    service_ratings: {
      attention_quality: 5,
      facility_cleanliness: 5,
      staff_friendliness: 5,
      price_quality_ratio: 4,
    },
    tags: ["Profesional", "Buen trato"],
  },
  {
    id: 2,
    first_name: "Carlos",
    last_name: "Rodríguez",
    message:
      "Buena atención aunque las instalaciones podrían mejorar un poco. El precio fue razonable para la calidad del servicio.",
    pacient_type: "Paciente de Consulta Oftalmológica",
    score: 4,
    date: "2023-11-02",
    service_ratings: {
      attention_quality: 4,
      facility_cleanliness: 3,
      staff_friendliness: 5,
      price_quality_ratio: 4,
    },
    tags: ["Oftalmólogo", "Buen precio"],
    response:
      "Gracias por tus amables palabras María. Nos alegra saber que tu experiencia fue positiva.",
  },
  {
    id: 3,
    first_name: "Ana",
    last_name: "Martínez",
    message:
      "Excelente experiencia desde el principio hasta el final. El personal fue muy amable y el doctor explicó todo con detalle.",
    pacient_type: "Paciente de Cirugía LASIK",
    score: 5,
    date: "2023-09-20",
    service_ratings: {
      attention_quality: 5,
      facility_cleanliness: 5,
      staff_friendliness: 5,
      price_quality_ratio: 5,
    },
    tags: ["Profesional", "Amabilidad", "Tecnología avanzada"],
  },
  {
    id: 4,
    first_name: "Juan",
    last_name: "Pérez",
    message:
      "El procedimiento fue rápido pero la sala de espera estaba algo descuidada. El doctor sin embargo fue muy competente.",
    pacient_type: "Paciente de Examen de Vista",
    score: 3,
    date: "2023-12-05",
    service_ratings: {
      attention_quality: 4,
      facility_cleanliness: 2,
      staff_friendliness: 3,
      price_quality_ratio: 3,
    },
    tags: ["Rápido", "Profesional"],
  },
];

const editingResponseId = ref(null);
const newResponseText = ref("");

const showResponseForm = (reviewId, currentResponse = "") => {
  editingResponseId.value = reviewId;
  newResponseText.value = currentResponse;
};

const cancelResponse = () => {
  editingResponseId.value = null;
  newResponseText.value = "";
};

const submitResponse = (reviewId) => {
  const review = doctorReviews.value.find((r) => r.id === reviewId);
  if (review) {
    review.response = newResponseText.value;
    review.response_date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    editingResponseId.value = null;
    newResponseText.value = "";
  }
};

const removeResponse = (reviewId) => {
  const review = doctorReviews.value.find((r) => r.id === reviewId);
  if (review) {
    review.response = "";
    review.response_date = "";
  }
};

// Calculate average ratings
const averageRatings = computed(() => {
  const totals = doctorReviews.reduce(
    (acc, review) => {
      acc.attention_quality += review.service_ratings.attention_quality;
      acc.facility_cleanliness += review.service_ratings.facility_cleanliness;
      acc.staff_friendliness += review.service_ratings.staff_friendliness;
      acc.price_quality_ratio += review.service_ratings.price_quality_ratio;
      return acc;
    },
    {
      attention_quality: 0,
      facility_cleanliness: 0,
      staff_friendliness: 0,
      price_quality_ratio: 0,
    }
  );

  const count = doctorReviews.length;
  return {
    attention_quality: (totals.attention_quality / count).toFixed(1),
    facility_cleanliness: (totals.facility_cleanliness / count).toFixed(1),
    staff_friendliness: (totals.staff_friendliness / count).toFixed(1),
    price_quality_ratio: (totals.price_quality_ratio / count).toFixed(1),
  };
});

// Calculate rating distribution
const ratingDistribution = computed(() => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  doctorReviews.forEach((review) => {
    distribution[review.score]++;
  });
  return distribution;
});

// Get all unique tags
const allTags = computed(() => {
  const tags = new Set();
  doctorReviews.forEach((review) => {
    review.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard-reviews">
    <div class="card">
      <div class="card-body p-4">
        <div class="row gap-2 d-flex">
          <div class="col-md-6 border-end">
            <p
              class="fw-semibold d-flex align-items-center justify-content-between"
            >
              Reseñas logradas
              <small class="text-muted">
                {{ averageRatings.attention_quality }}
                <span class="fw-light"
                  >({{ doctorReviews.length }} Opiniones)</span
                >
              </small>
            </p>
            <div class="d-flex justify-content-between fw-light text-muted">
              Calidad de atención
              <span class="text-warning">
                <AtomsIconsStarFilled
                  v-for="i in Math.round(averageRatings.attention_quality)"
                  :key="`aq-${i}`"
                />
                <AtomsIconsStarOutline
                  v-for="i in 5 - Math.round(averageRatings.attention_quality)"
                  :key="`aq-empty-${i}`"
                />
              </span>
            </div>
            <div class="d-flex justify-content-between fw-light text-muted">
              Limpieza de instalaciones
              <span class="text-warning">
                <AtomsIconsStarFilled
                  v-for="i in Math.round(averageRatings.facility_cleanliness)"
                  :key="`fc-${i}`"
                />
                <AtomsIconsStarOutline
                  v-for="i in 5 -
                  Math.round(averageRatings.facility_cleanliness)"
                  :key="`fc-empty-${i}`"
                />
              </span>
            </div>
            <div class="d-flex justify-content-between fw-light text-muted">
              Amabilidad del Staff
              <span class="text-warning">
                <AtomsIconsStarFilled
                  v-for="i in Math.round(averageRatings.staff_friendliness)"
                  :key="`sf-${i}`"
                />
                <AtomsIconsStarOutline
                  v-for="i in 5 - Math.round(averageRatings.staff_friendliness)"
                  :key="`sf-empty-${i}`"
                />
              </span>
            </div>
            <div class="d-flex justify-content-between fw-light text-muted">
              Relacion Precio/Calidad
              <span class="text-warning">
                <AtomsIconsStarFilled
                  v-for="i in Math.round(averageRatings.price_quality_ratio)"
                  :key="`pq-${i}`"
                />
                <AtomsIconsStarOutline
                  v-for="i in 5 -
                  Math.round(averageRatings.price_quality_ratio)"
                  :key="`pq-empty-${i}`"
                />
              </span>
            </div>
          </div>
          <div class="col-md-5">
            <p class="fw-semibold">Servicios Destacados</p>
            <div>
              <span
                v-for="(tag, index) in allTags"
                :key="index"
                class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card mt-2">
      <div class="card-body p-4">
        <div class="row gap-2 d-flex">
          <div class="col-md-3 border-end">
            <p
              class="fw-semibold d-flex align-items-center justify-content-between"
            >
              Filtrar por rating
            </p>
            <div
              v-for="rating in [5, 4, 3, 2, 1]"
              :key="rating"
              class="d-flex justify-content-between fw-light text-muted"
            >
              <p class="fw-bold">
                {{
                  Math.round(
                    (ratingDistribution[rating] / doctorReviews.length) * 100
                  )
                }}%
              </p>
              <span class="fw-light"
                >({{ ratingDistribution[rating] }} Opiniones)</span
              >
              <span class="text-warning">
                <AtomsIconsStarFilled
                  v-for="i in rating"
                  :key="`dist-${rating}-${i}`"
                />
                <AtomsIconsStarOutline
                  v-for="i in 5 - rating"
                  :key="`dist-empty-${rating}-${i}`"
                />
              </span>
            </div>
          </div>
          <div class="col-md-8">
            <div
              class="col mt-2"
              v-for="review in doctorReviews"
              :key="review.id"
            >
              <div class="card h-100 rounded-4 shadow-sm border-none">
                <div class="card-body d-flex flex-column">
                  <div
                    class="d-flex align-items-center justify-content-between mb-3"
                  >
                    <div>
                      <p class="text-primary fw-semibold m-0">
                        {{ review.first_name }} {{ review.last_name }}
                      </p>
                      <p class="text-muted m-0">{{ review.pacient_type }}</p>
                      <small class="text-muted">{{ review.date }}</small>
                    </div>
                    <div class="text-warning">
                      <AtomsIconsStarFilled
                        v-for="i in review.score"
                        :key="`rev-${review.id}-${i}`"
                      />
                      <AtomsIconsStarOutline
                        v-for="i in 5 - review.score"
                        :key="`rev-empty-${review.id}-${i}`"
                      />
                    </div>
                  </div>
                  <p class="fst-italic my-3 flex-grow-1">
                    "{{ review.message }}"
                  </p>
                  <div class="d-flex flex-wrap gap-1 mb-3">
                    <span
                      v-for="(tag, index) in review.tags"
                      :key="index"
                      class="badge bg-light text-dark rounded-pill"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <p class="fw-semibold">
                      Encuesta de Calificación del servicio
                    </p>
                  </div>
                  <div
                    class="d-flex justify-content-between fw-light text-muted"
                  >
                    <p class="fw-bold mb-0">Calidad de atención</p>
                    <span class="text-warning">
                      <AtomsIconsStarFilled
                        v-for="i in review.service_ratings.attention_quality"
                        :key="`aq-${review.id}-${i}`"
                      />
                      <AtomsIconsStarOutline
                        v-for="i in 5 -
                        review.service_ratings.attention_quality"
                        :key="`aq-empty-${review.id}-${i}`"
                      />
                    </span>
                  </div>
                  <div
                    class="d-flex justify-content-between fw-light text-muted"
                  >
                    <p class="fw-bold mb-0">Limpieza de instalaciones</p>
                    <span class="text-warning">
                      <AtomsIconsStarFilled
                        v-for="i in review.service_ratings.facility_cleanliness"
                        :key="`fc-${review.id}-${i}`"
                      />
                      <AtomsIconsStarOutline
                        v-for="i in 5 -
                        review.service_ratings.facility_cleanliness"
                        :key="`fc-empty-${review.id}-${i}`"
                      />
                    </span>
                  </div>
                  <div
                    class="d-flex justify-content-between fw-light text-muted"
                  >
                    <p class="fw-bold mb-0">Amabilidad del Staff</p>
                    <span class="text-warning">
                      <AtomsIconsStarFilled
                        v-for="i in review.service_ratings.staff_friendliness"
                        :key="`sf-${review.id}-${i}`"
                      />
                      <AtomsIconsStarOutline
                        v-for="i in 5 -
                        review.service_ratings.staff_friendliness"
                        :key="`sf-empty-${review.id}-${i}`"
                      />
                    </span>
                  </div>
                  <div
                    class="d-flex justify-content-between fw-light text-muted"
                  >
                    <p class="fw-bold mb-0">Relacion Precio/Calidad</p>
                    <span class="text-warning">
                      <AtomsIconsStarFilled
                        v-for="i in review.service_ratings.price_quality_ratio"
                        :key="`pq-${review.id}-${i}`"
                      />
                      <AtomsIconsStarOutline
                        v-for="i in 5 -
                        review.service_ratings.price_quality_ratio"
                        :key="`pq-empty-${review.id}-${i}`"
                      />
                    </span>
                  </div>
                  <div v-if="editingResponseId === review.id" class="mb-3 mt-4">
                    <textarea
                      v-model="newResponseText"
                      class="form-control mb-2"
                      rows="3"
                      placeholder="Escribe tu respuesta aquí..."
                    >
                    </textarea>
                    <div class="d-flex justify-content-end gap-2">
                      <button
                        @click="cancelResponse"
                        class="btn btn-outline-secondary btn-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        @click="submitResponse(review.id)"
                        class="btn btn-primary btn-sm"
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="review.response"
                    class="bg-yellow-light review-response p-3 rounded mb-3"
                  >
                    <div
                      class="d-flex justify-content-between align-items-center mb-2"
                    >
                      <strong>Respuesta de Reseña</strong>
                      <small class="text-muted">{{
                        review.response_date
                      }}</small>
                    </div>
                    <p class="m-0">{{ review.response }}</p>
                  </div>
                  <div class="d-flex justify-content-end gap-2 mt-2">
                    <button
                      v-if="!review.response && editingResponseId !== review.id"
                      @click="showResponseForm(review.id)"
                      class="btn btn-primary"
                    >
                      <span class="me-1">
                        <img
                          src="@/src/assets/return.svg"
                          alt="Cancelar Cita"
                        />
                      </span>
                      Responder Reseña
                    </button>
                    <button
                      v-if="review.response && editingResponseId !== review.id"
                      @click="removeResponse(review.id)"
                      class="btn btn-outline-secondary"
                    >
                      <span class="me-1">
                        <img
                          src="@/src/assets/remove.svg"
                          alt="Cancelar Cita"
                        />
                      </span>
                      Eliminar respuesta
                    </button>
                    <button
                      v-if="review.response && editingResponseId !== review.id"
                      @click="showResponseForm(review.id, review.response)"
                      class="btn btn-primary"
                    >
                      Editar respuesta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<style scoped>
.review-response {
  border-radius: 10px;
  background: var(--Secondary-V1-Yellow-01, #fefcf3);
}
</style>
