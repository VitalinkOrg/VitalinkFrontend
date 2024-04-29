<script setup>
import { ref } from "vue";
const open = ref(false);
const tab = ref(1);
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <main class="bg-light">
      <div class="container py-5">
        <div class="card p-5 rounded-4 bg-primary-subtle border-0">
          <h4 class="text-primary fw-semibold">
            Bienvenido a la página de ayuda y soporte de Vitalink
          </h4>
          <form class="row g-3">
            <div class="col-5">
              <input
                type="text"
                class="form-control"
                id="inputPassword2"
                placeholder="Buscar"
              />
            </div>
            <div class="col-auto">
              <button type="submit" class="btn btn-primary mb-3">Buscar</button>
            </div>
          </form>
        </div>
        <div class="row justify-content-center my-5">
          <div class="col-8 row justify-content-evenly">
            <div
              class="col-4 rounded-4 fw-semibold d-flex justify-content-center text-center card p-5 fs-3 cursor-pointer"
              :class="open ? 'text-white bg-info border-ayuda' : 'bg-info-subtle text-info border-0'"
              @click="open = true"
            >
              FAQs
            </div>
            <div
              class="col-4 rounded-4 text-info fw-semibold d-flex justify-content-center text-center card p-5 fs-3 cursor-pointer"
              :class="!open ? 'text-white bg-info border-ayuda' : 'bg-info-subtle text-info border-0'"
              @click="open = false"
            >
              Realizar un reclamo
            </div>
          </div>
          <div v-if="!open" class="col-8 my-5">
            <p class="text-center text-secondary mb-5">
              Si tienes algún problema con tu cuenta de Vitalink, puedes
              completar el siguiente formulario y nosotros nos encargaremos de
              ayudarte
            </p>
            <form action="">
              <div class="card border-0">
                <h6 class="text-center mt-4 fs-5 fw-semibold">
                  Formulario de reclamos
                </h6>
                <hr />
                <div class="bg-light card border-0 m-3 p-4">
                  <h6 class="fw-semibold">
                    Datos Personales de quien solicita el reclamo
                  </h6>
                  <div class="form-group my-3">
                    <label for="nombre" class="form-label">Nombre (s)</label>
                    <input
                      type="text"
                      placeholder="Escribe tu nombre"
                      class="form-control shadow-sm"
                      id="nombre"
                      name="nombre"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="nombre" class="form-label">Apellido (s)</label>
                    <input
                      type="text"
                      placeholder="Escribe tu apellido"
                      class="form-control shadow-sm"
                      id="nombre"
                      name="nombre"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="nombre" class="form-label"
                      >Correo Electrónico</label
                    >
                    <input
                      type="email"
                      placeholder="Escribe tu correo electrónico"
                      class="form-control shadow-sm"
                      id="nombre"
                      name="nombre"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="nombre" class="form-label"
                      >Número de teléfono</label
                    >
                    <input
                      type="phone"
                      placeholder="+1 (555) 000-0000"
                      class="form-control shadow-sm"
                      id="nombre"
                      name="nombre"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="direccion" class="form-label">Dirección</label>
                    <input
                      type="text"
                      placeholder="Dirección"
                      class="form-control shadow-sm"
                      id="direccion"
                      name="direccion"
                    />
                  </div>
                  <hr />
                  <h6 class="fw-semibold">¿Cuál es el inconveniente?</h6>
                  <div class="form-group mb-3">
                    <label for="direccion" class="form-label"
                      >Descripción</label
                    >
                    <textarea
                      type="text"
                      placeholder="Escribe una descripción"
                      class="form-control shadow-sm"
                      id="direccion"
                      rows="4"
                      name="direccion"
                    ></textarea>
                  </div>
                </div>
                <hr />
                <button type="submit" class="btn btn-primary m-3">
                  Enviar
                </button>
              </div>
            </form>
          </div>
          <div v-else class="col-8 my-5">
            <h2 class="text-center fw-semibold">Preguntas frecuentes</h2>
            <p class="text-center text-secondary mb-5">
              Estas son algunas preguntas y respuestas frecuentes sobre nuestros
              servicios.
            </p>
            <div class="mb-4">
              <ul
                class="nav nav-underline d-flex justify-content-evenly flex-row w-100"
              >
                <li class="nav-item">
                  <button class="nav-link text-secondary" :class="tab === 1 ? 'active text-info' : ''">
                    General
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link text-secondary" :class="tab === 2 ? 'active text-info' : ''">
                    Citas
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link text-secondary" :class="tab === 3 ? 'active text-info' : ''">
                    Váuchers
                  </button>
                </li>
                <li class="nav-item">
                  <button class="nav-link text-secondary" :class="tab === 4 ? 'active text-info' : ''">
                    Servicios
                  </button>
                </li>
              </ul>
            </div>
            <div
              class="col align-items-center justify-content-center d-flex flex-column p-4"
            >
              <WebsiteFaqItem
                title="¿Cuáles son los tipos de cirugía disponibles en VitaLink?"
              />
              <WebsiteFaqItem
                title="¿Puedo programar citas directamente a través de VitaLink?"
              />
              <WebsiteFaqItem
                title="¿Cómo protege VitaLink mi información personal y médica?"
              />
              <WebsiteFaqItem
                title=" ¿Qué hace diferente a VitaLink de otros directorios de salud?"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </NuxtLayout>
</template>
<style>
.border-ayuda {
  border: 10px solid var(--Primary-Gradients-02-Aqua-02, #C2EBEE);
}
</style>
