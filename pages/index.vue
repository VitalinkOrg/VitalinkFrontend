<template>
  <NuxtLayout name="web">
    <div class="bg-light">
      <header class="d-flex align-items-center">
        <div class="container">
          <h1 class="display-3 text-center">BIENVENIDO A VITALINK:</h1>
          <h1 class="display-5 text-center">
            Tu Conexión con la Mejor Atención Quirúrgica
          </h1>
          <p class="text-center text-muted col-sm-8 mx-auto mb-0">
            Conéctate con cirujanos de primer nivel e instituciones de salud.
          </p>
          <p class="text-center text-muted col-sm-8 mx-auto">
            Tu camino hacia una atención quirúrgica superior comienza aquí.
          </p>
          <WebsiteSearchBar />
        </div>
      </header>

      <section class="py-5">
        <div class="container">
          <h2 class="display-5 text-center col-sm-8 mx-auto">
            Obtenga atención en tres sencillos pasos
          </h2>

          <div class="row row-cols-sm-3 py-5">
            <div>
              <div class="card rounded-4 border-0 shadow text-center">
                <div class="card-body">
                  ICON
                  <h3 class="h6">Busca un procedimiento</h3>
                  <p class="text-muted">
                    Navega fácilmente por nuestra plataforma para descubrir
                    profesionales que se especializan en la cirugía que
                    necesitas.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div class="card rounded-4 border-0 shadow text-center">
                <div class="card-body">
                  ICON
                  <h3 class="h6">Compara ofertas</h3>
                  <p class="text-muted">
                    VitaLink te permite encontrar la combinación perfecta para
                    tus necesidades quirúrgicas con precisión y facilidad.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div class="card rounded-4 border-0 shadow text-center">
                <div class="card-body">
                  ICON
                  <h3 class="h6">Reserva una cita</h3>
                  <p class="text-muted">
                    Una vez que hayas identificado al profesional o institución
                    adecuados, programa citas sin esfuerzo a través de nuestra
                    plataforma.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <NuxtLink class="btn btn-info">Empezar ahora</NuxtLink>
          </div>
        </div>
      </section>

      <section class="py-5">
        <div class="container">
          <div class="card bg-primary-subtle rounded-5 border-0">
            <div class="card-body ps-5">
              <div class="d-flex align-items-center">
                <div class="col-sm-6">
                  <h2 class="display-6">¿Listo para empezar la búsqueda?</h2>
                  <p class="text-muted mb-4">
                    Estamos aquí para hacer que el proceso de encontrar al
                    cirujano adecuado sea lo más fácil posible.
                  </p>
                  <NuxtLink class="btn btn-primary px-4"
                    >Empezar ahora</NuxtLink
                  >
                </div>
                <div>
                  <img
                    src="@/src/assets/img-busca-centro-medico.png"
                    alt="Busca centro medico"
                    class="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section class="bg-white py-5">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-sm-6">
            <img
              src="@/src/assets/img-busca-centro-medico.png"
              alt="Busca centro medico"
              class="img-fluid"
            />
          </div>
          <div class="col">
            <h2 class="display-6">Números que muestran nuestro éxito</h2>
            <p class="text-muted">
              Algunos datos que reflejan nuestro éxito y la confianza depositada
              en nosotros por la comunidad de usuarios en busca de atención
              quirúrgica de calidad:
            </p>

            <div class="row row-cols-2 py-2">
              <div>
                <p class="h3 text-warning">200+</p>
                <h4 class="h5">Profesionales Registrados</h4>
                <p class="text-muted">
                  <small
                    >Cirujanos, especialistas y expertos en diversas disciplinas
                    médicas.</small
                  >
                </p>
              </div>
              <div>
                <p class="h3 text-warning">97%</p>
                <h4 class="h5">Éxito en Coincidencias</h4>
                <p class="text-muted">
                  <small
                    >Al conectar a usuarios con profesionales que cumplen con
                    sus criterios específicos de cirugía.</small
                  >
                </p>
              </div>
              <div>
                <p class="h3 text-warning">100%</p>
                <h4 class="h5">Opiniones Positivas</h4>
                <p class="text-muted">
                  <small
                    >Nos enorgullece ser la elección preferida para aquellos que
                    buscan atención quirúrgica excepcional.</small
                  >
                </p>
              </div>
              <div>
                <p class="h3 text-warning">5000+</p>
                <h4 class="h5">Citas Programadas</h4>
                <p class="text-muted">
                  <small
                    >Conectando a pacientes con cirujanos especializados de
                    manera eficiente y rápida.</small
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-light py-4">
      <div class="container">
        <div class="card bg-info rounded-5 border-0 my-5">
          <div class="card-body py-3">
            <div class="row align-items-center">
              <div class="col-sm-6 ps-5">
                <h2 class="h2 text-white">
                  <strong>Quienes confían en nosotros</strong>
                </h2>
                <p class="text-white">
                  Estos Centros Médicos forman parte de nuestro directorio de
                  instituciones especializadas.
                </p>
              </div>
              <div class="col">
                <div class="row row-cols-3">
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                  <img
                    src="@/src/assets/img-logo-quienes-confian.svg"
                    alt="logo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white py-5">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col ms-sm-5 col-sm-4">
            <h2 class="display-6">Qué dicen de nuestro servicio?</h2>
            <p class="text-muted">
              Nuestra comunidad de usuarios ha expresado su satisfacción a
              través de calificaciones y opiniones positivas.
            </p>
          </div>
          <div
            class="col ms-5 d-flex"
            style="white-space: nowrap; overflow-x: auto"
          >
            <div
              class="card rounded-4 bg-primary p-3 me-4"
              style="text-wrap: initial; min-width: 30rem"
            >
              <div
                class="card-body bg-light rounded-4"
                style="--bs-bg-opacity: 0.2"
              >
                <div class="text-warning mb-3">
                  <AtomsIconsStar />
                  <AtomsIconsStar />
                  <AtomsIconsStar />
                  <AtomsIconsStar />
                  <AtomsIconsStar />
                </div>
                <h4 class="text-light">¡Fue realmente fácil!</h4>
                <p class="text-light mb-4">
                  <small
                    >Desde el primer momento en el que ingresé a la plataforma,
                    quedé impresionado por la interfaz intuitiva y fácil de
                    usar. La función de búsqueda especializada en cirugía me
                    permitió encontrar rápidamente a profesionales de la salud
                    que se especializaban exactamente en el tipo de
                    procedimiento que necesitaba. La cantidad de opciones y la
                    diversidad de perfiles me brindaron una amplia gama de
                    elecciones para encontrar al especialista perfecto.</small
                  >
                </p>
                <p class="text-light">
                  <strong>Stephanie Powell</strong> | Usuario de Vitalink
                </p>
              </div>
            </div>
            <div
              class="card rounded-4 bg-primary p-3 me-4"
              style="text-wrap: initial; min-width: 30rem"
            >
              <div
                class="card-body bg-light rounded-4"
                style="--bs-bg-opacity: 0.2"
              >
                <div class="text-warning mb-3">
                  <AtomsIconsStar />
                  <AtomsIconsStar />
                  <AtomsIconsStar />
                  <AtomsIconsStar />
                  <AtomsIconsStar />
                </div>
                <h4 class="text-light">¡Fue realmente fácil!</h4>
                <p class="text-light mb-4">
                  <small
                    >Desde el primer momento en el que ingresé a la plataforma,
                    quedé impresionado por la interfaz intuitiva y fácil de
                    usar. La función de búsqueda especializada en cirugía me
                    permitió encontrar rápidamente a profesionales de la salud
                    que se especializaban exactamente en el tipo de
                    procedimiento que necesitaba. La cantidad de opciones y la
                    diversidad de perfiles me brindaron una amplia gama de
                    elecciones para encontrar al especialista perfecto.</small
                  >
                </p>
                <p class="text-light">
                  <strong>Stephanie Powell</strong> | Doctora, Usuario de
                  Vitalink
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col d-flex justify-content-end me-5 mt-4">
            <button class="btn btn-circle btn-warning-subtle rounded-circle">
              L
            </button>
            <button class="btn btn-circle btn-warning rounded-circle">R</button>
          </div>
        </div>
      </div>
    </section>

    <div class="bg-light">
      <section class="py-5">
        <div class="container">
          <div
            class="card bg-primary rounded-5 border-0"
            style="--bs-bg-opacity: 0.05"
          >
            <div class="card-body p-0">
              <div class="d-flex align-items-center">
                <div class="co ps-5">
                  <h2 class="display-6">
                    ¿Emocionado por empezar tu búsqueda?
                  </h2>
                  <p class="text-muted mb-4">
                    En VitaLink, no solo te conectamos con profesionales de la
                    salud, sino que también trabajamos incansablemente para
                    asegurarnos de que tu experiencia sea exitosa y positiva.
                  </p>

                  <form class="d-flex ms-2">
                    <input
                      class="form-control me-2"
                      type="email"
                      placeholder="Escribe tu correo electrónico"
                      aria-label="Search"
                    />
                    <button class="btn btn-primary" type="submit">
                      Suscribirse
                    </button>
                  </form>
                  <!-- <NuxtLink class="btn btn-primary px-4">Empezar ahora</NuxtLink> -->
                </div>
                <div class="col-sm-4 offset-sm-1 pe-4">
                  <img
                    src="@/src/assets/img-buscar-miles-medicos.png"
                    alt="Busca centro medico"
                    class="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5">
        <div class="container">
          <h2 class="display-6 text-center">Déjanos saber que piensas</h2>
          <p class="text-center text-muted col-sm-8 mx-auto">
            Si tienes alguna pregunta, o comentario sobre nuestros servicios,
            estamos felices de ayudar, escríbenos:
          </p>

          <div class="row">
            <div class="col-sm-11 mx-auto py-4">
              <div class="row align-items-center">
                <div class="col">
                  <h4 class="h5">Medios de Contacto</h4>
                  <p>Nos pondremos en contacto en las próximas 24 horas.</p>
                  <div class="d-flex align-items-center mb-3">
                    ICON
                    <div class="d-flex flex-column ms-3">
                      <span class="h6">Email:</span>
                      <small>preguntas@vitalink.com</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center mb-3">
                    ICON
                    <div class="d-flex flex-column ms-3">
                      <span class="h6">Phone:</span>
                      <small>(414) 687 - 5892</small>
                    </div>
                  </div>
                  <p class="text-muted mb-0">Síguenos en redes sociales</p>
                  <p>Icon Icon Icon Icon Icon</p>
                </div>
                <div class="col">
                  <div class="card shadow-lg border-0 rounded-5">
                    <div class="card-body p-4">
                      <form action="">
                        <div class="row">
                          <div class="col">
                            <div class="form-group">
                              <label for="nombre" class="form-label"
                                >Nombre</label
                              >
                              <input
                                type="text"
                                class="form-control"
                                id="nombre"
                                aria-describedby="nombreHelp"
                                placeholder="Brian Clark"
                              />
                              <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                            </div>
                          </div>
                          <div class="col">
                            <div class="form-group">
                              <label for="email" class="form-label"
                                >Correo Electrónico</label
                              >
                              <input
                                type="email"
                                class="form-control"
                                id="email"
                                aria-describedby="emailHelp"
                                placeholder="example@youremail.com"
                              />
                              <!-- <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                            </div>
                          </div>
                        </div>
                        <div class="form-group">
                          <label for="telephono" class="form-label"
                            >Número de Teléfono</label
                          >
                          <input
                            type="phone"
                            class="form-control"
                            id="telephono"
                            aria-describedby="telephonoHelp"
                            placeholder="+1(555) 000-0000"
                          />
                          <!-- <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                        </div>
                        <div class="form-group">
                          <label for="mensaje" class="form-label"
                            >Mensaje</label
                          >
                          <textarea
                            type="mensaje"
                            class="form-control"
                            id="mensaje"
                            aria-describedby="mensajeHelp"
                            placeholder="Escribe tu mensaje aquí"
                          ></textarea>
                          <!-- <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                        </div>
                        <button class="btn btn-warning">Contactar</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5">
        <div class="container">
          <div class="card rounded-5 border-0 shadow">
            <div class="row">
              <div
                class="col bg-info rounded-start-5 rounded-0 p-5 align-items-center d-flex"
              >
                <div class="py-4 ps-3">
                  <h2 class="h2 text-light">Preguntas Frecuentes</h2>
                  <p class="text-light">
                    Estas preguntas frecuentes están diseñadas para proporcionar
                    respuestas claras y útiles a los usuarios de VitaLink. Si
                    tienes preguntas adicionales, no dudes en ponerte en
                    contacto con nuestro equipo de soporte.
                  </p>
                  <button class="btn btn-light text-info mt-2">
                    Contactar
                  </button>
                </div>
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
      </section>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
header {
  min-height: 80vh;
  background-color: #ebecf7;
}
</style>
