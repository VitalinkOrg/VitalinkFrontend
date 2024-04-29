<template>
  <footer class="py-5 border-top border-primary border-3 shadow-lg">
    <div class="container">
      <div class="row row-cols-4">
        <div class="col">
          <img
            src="@/src/assets/img-vitalink-logo.svg"
            alt="Vitalink"
            class="mb-2"
          />
          <p>
            <small class="text-muted"
              >Comienza tu búsqueda hoy y experimenta la vitalidad de la
              atención médica excepcional con VitaLink!
            </small>
          </p>
        </div>
        <div class="col">
          <h4 class="text-success h6">About Us</h4>
          <ul class="list-unstyled">
            <li>
              <NuxtLink href="">Misión</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Nuestro equipo</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Testimonios</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Política de Privacidad</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="col">
          <h4 class="text-success h6">Services</h4>
          <ul class="list-unstyled">
            <li>
              <NuxtLink href="">Cirugías Pediatricas</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Cirugías Oncológicas</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Cirugías Oftalmicas</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Cirugías Dentales</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Cirugías Gastrointestinales</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="col">
          <h4 class="text-success h6">Contact us</h4>
          <ul class="list-unstyled">
            <li>
              <NuxtLink href="">Información</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Solicitar presupuesto</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Consultas</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Centro de ayuda</NuxtLink>
            </li>
            <li>
              <NuxtLink href="">Términos y condiciones</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="row my-4">
        <div class="col-6">
          <div
            class="bg-light d-flex py-2 px-4 rounded-4 align-items-center"
          >
            Recibe las últimas novedades
            <form class="d-flex ms-2 w-100">
              <input
                class="form-control me-2"
                type="email"
                placeholder="Escribe tu correo electrónico"
                aria-label="Search"
              />
              <button class="btn btn-warning" type="submit">Suscribirse</button>
            </form>
          </div>
        </div>
      </div>
      <hr />
      <div class="my-5 d-flex">
        Copyright @ 2023 VitalinkCR | All Rights Reserved |
        <NuxtLink class="btn-link px-2" href="">Terms and Conditions </NuxtLink>
        | <NuxtLink class="btn-link px-2"> Privacy Policy</NuxtLink>

        <div class="ms-auto">Icon | Icon | Icon | Icon</div>
      </div>
    </div>
  </footer>
</template>
