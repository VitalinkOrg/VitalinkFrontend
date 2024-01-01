<template>
	<NuxtLayout name="web">
		<div class="bg-light">
			<header class="d-flex align-items-center">
				<div class="container">
					<h1 class="display-5 text-center">Bienestar a tu alcance: encuentra y programa citas médicas
					</h1>
					<p class="text-center text-muted col-sm-8 mx-auto">Pon tu salud en primer lugar con nuestro directorio de
						médicos
						y una
						forma
						conveniente de agendar tus citas.
					</p>
					<div class="card">
						<div class="card-body">
							<form class="d-flex align-items-end" action="/buscar/wovnworv">
								<div class="row row-cols-sm-3 w-100">
									<div class="form-group">
										<label for="procedimiento" class="form-label">Procedimiento</label>
										<input type="text" class="form-control" id="procedimiento" placeholder="Operacion de cataratas"
											aria-describedby="procedimiento-help">
										<!-- <div id="procedimiento-help" class="form-text ">We'll never share your email with anyone else.</div> -->
									</div>
									<div class="form-group">
										<label for="lugar" class="form-label">Lugar</label>
										<input type="text" class="form-control" id="lugar" aria-describedby="lugar-help"
											placeholder="Costa Rica">
										<!-- <div id="lugar-help" class="form-text ">We'll never share your email with anyone else.</div> -->
									</div>
									<div class="form-group">
										<label for="vaucher" class="form-label">Código de Vaucher</label>
										<input type="text" class="form-control" id="vaucher" aria-describedby="vaucher-help"
											placeholder="Código de Vaucher">
										<!-- <div id="vaucher-help" class="form-text ">We'll never share your email with anyone else.</div> -->
									</div>
								</div>
								<div class="form-group col-auto ms-4">
									<button type="submit" class="btn btn-warning px-4">Buscar</button>
								</div>
							</form>
						</div>
					</div>
					<p class="text-center pt-5">
						<NuxtLink class="btn-link">Solicitar un Vaucher Request</NuxtLink>
					</p>
				</div>
			</header>

			<section class="py-5">
				<div class="container">
					<h2 class="display-5 text-center col-sm-8 mx-auto">Obtenga atención en tres sencillos pasos</h2>

					<div class="row row-cols-sm-3 py-5">
						<div>
							<div class="card rounded-4 border-0 shadow text-center">
								<div class="card-body">
									ICON
									<h3 class="h6">Busca un procedimiento</h3>
									<p class="text-muted">Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalar cons
										elementum
										tempus hac.</p>
								</div>
							</div>
						</div>
						<div>
							<div class="card rounded-4 border-0 shadow text-center">
								<div class="card-body">
									ICON
									<h3 class="h6">Compara ofertas</h3>
									<p class="text-muted">Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalar cons
										elementum
										tempus hac.</p>
								</div>
							</div>
						</div>
						<div>
							<div class="card rounded-4 border-0 shadow text-center">
								<div class="card-body">
									ICON
									<h3 class="h6">Reserva una cita</h3>
									<p class="text-muted">Lorem ipsum dolor sit amet consecte tur adipiscing elit semper dalar cons
										elementum
										tempus hac.</p>
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
									<p class="text-muted mb-4">Un centro médico te está esperando</p>
									<NuxtLink class="btn btn-primary px-4">Empezar ahora</NuxtLink>
								</div>
								<div>
									<img src="@/src/assets/img-busca-centro-medico.png" alt="Busca centro medico" class="img-fluid">
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
						<img src="@/src/assets/img-busca-centro-medico.png" alt="Busca centro medico" class="img-fluid">
					</div>
					<div class="col">
						<h2 class="display-6">Números que muestran nuestro éxito</h2>
						<p class="text-muted">Lorem ipsum dolor sit amet consectetur nunc nunc sit velit eget sollicitudin sit posuere
						</p>

						<div class="row row-cols-2 py-2">
							<div>
								<p class="h3 text-warning">200+</p>
								<h4 class="h5">Lorem ipsum dolor</h4>
								<p class="text-muted"><small>Lorem ipsum dolor sit amet consectetur adipiscing elitolmel.</small></p>
							</div>
							<div>
								<p class="h3 text-warning">97%</p>
								<h4 class="h5">Lorem ipsum dolor</h4>
								<p class="text-muted"><small>Lorem ipsum dolor sit amet consectetur adipiscing elitolmel.</small></p>
							</div>
							<div>
								<p class="h3 text-warning">34+</p>
								<h4 class="h5">Lorem ipsum dolor</h4>
								<p class="text-muted"><small>Lorem ipsum dolor sit amet consectetur adipiscing elitolmel.</small></p>
							</div>
							<div>
								<p class="h3 text-warning">100+</p>
								<h4 class="h5">Lorem ipsum dolor</h4>
								<p class="text-muted"><small>Lorem ipsum dolor sit amet consectetur adipiscing elitolmel.</small></p>
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
								<h2 class="h2 text-white"><strong>Quienes confían en nosotros</strong></h2>
								<p class="text-white">Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma</p>
							</div>
							<div class="col">
								<div class="row row-cols-3">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
									<img src="@/src/assets/img-logo-quienes-confian.svg" alt="logo">
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
						<p class="text-muted">Lorem ipsum dolor sit amet consectetur nunc nunc sit velit eget sollicitudin sit posuere
						</p>
					</div>
					<div class="col ms-5 d-flex" style="white-space: nowrap;overflow-x: auto;">
						<div class=" card rounded-4 bg-primary p-3 me-4" style="text-wrap:initial;min-width: 30rem">
							<div class="card-body bg-light rounded-4" style="--bs-bg-opacity: .2;">
								STARS
								<h4 class=" text-light">¡Fue realmente fácil!</h4>
								<p class="text-light mb-4">
									<small>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
										labore et
										dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
										aliquip
										ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
										dolore
										eu
										fugiat nulla pariatur.</small>
								</p>
								<p class="text-light"><strong>Stephanie Powell</strong> | Doctora, Usuario de Vitalink</p>
							</div>
						</div>
						<div class="card rounded-4 bg-primary p-3 me-4" style="text-wrap:initial;min-width: 30rem">
							<div class="card-body bg-light rounded-4" style="--bs-bg-opacity: .2;">
								STARS
								<h4 class=" text-light">¡Fue realmente fácil!</h4>
								<p class="text-light mb-4">
									<small>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
										labore et
										dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
										aliquip
										ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
										dolore
										eu
										fugiat nulla pariatur.</small>
								</p>
								<p class="text-light"><strong>Stephanie Powell</strong> | Doctora, Usuario de Vitalink</p>
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col d-flex justify-content-end me-5 mt-4">
						<button class="btn btn-circle btn-warning-subtle rounded-circle">L</button>
						<button class="btn btn-circle btn-warning rounded-circle">R</button>
					</div>
				</div>
			</div>
		</section>

		<div class="bg-light">
			<section class="py-5">
				<div class="container">
					<div class="card bg-primary rounded-5 border-0" style="--bs-bg-opacity: .05;">
						<div class="card-body ps-5">
							<div class="d-flex align-items-center">
								<div class="col-sm-6">
									<h2 class="display-6">¿Emocionado por empezar tu búsqueda?</h2>
									<p class="text-muted mb-4">Lorem ipsum dolor sit amet consectetur adipiscing eli mattis sit phasellus
										mollis sit aliquam sit nullam.</p>
									<NuxtLink class="btn btn-primary px-4">Empezar ahora</NuxtLink>
								</div>
								<div>
									<img src="@/src/assets/img-busca-centro-medico.png" alt="Busca centro medico" class="img-fluid">
								</div>
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
	background-color: #EBECF7;
}
</style>