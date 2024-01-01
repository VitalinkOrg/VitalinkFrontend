<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03"
        aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand" href="#">Vitalink</a>
      <div class="collapse navbar-collapse " id="navbarTogglerDemo03">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <!-- <a class="nav-link active" aria-current="page" href="#">Home</a> -->
            <NuxtLink href="/" class="nav-link" active-class="active">Home</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="" class="nav-link">¿Eres paciente?</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="" class="nav-link">¿Eres Doctor o Clínica?</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="" class="nav-link">¿Eres aseguradora?</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="" class="nav-link">Nosotros</NuxtLink>
          </li>
        </ul>
        <div class="">
          <button class="btn btn-outline-dark me-2">Ingresar</button>
          <button class="btn btn-primary">Registrarse</button>
        </div>
      </div>
    </div>
  </nav>
</template>