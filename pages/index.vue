<template>
	<NuxtLayout name="web">
		<header class="d-flex align-items-center">
			<div class="container">
				<h1 class="display-5 text-center"><strong>Bienestar a tu alcance: encuentra y programa citas médicas</strong></h1>
				<p class="text-center text-muted col-sm-8 mx-auto">Pon tu salud en primer lugar con nuestro directorio de médicos
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
	</NuxtLayout>
</template>

<style scoped lang="scss">
header {
	min-height: 80vh;
	background-color: #EBECF7;
}
</style>