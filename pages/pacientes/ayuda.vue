<template>
  <NuxtLayout name="pacientes-dashboard">
    <div class="container text-center py-5">
      <div class="card p-5 rounded-4 bg-light border-0">
        <h4 class="text-primary fw-semibold">
          Bienvenido a la página de ayuda y soporte de Vitalink
        </h4>
        <form class="row g-3">
          <div class="col-6">
            <input
              type="text"
              class="form-control"
              id="inputPassword2"
              placeholder="Buscar"
            />
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-primary mb-3">
              Buscar
            </button>
          </div>
        </form>
      </div>
      <div class="px-5 row g-5 justify-content-evenly mt-4">
        <div class="col-3 card p-5 fs-3">
            FAQs
        </div>
        <div class="col-3 card p-5 fs-3">
            Realizar un reclamo
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
