<template>
  <div v-if="isOpen" class="modal-overlay z-3">
    <div class="modal-content confirmation">
      <div class="modal-header">
        <button @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="65"
          height="64"
          viewBox="0 0 65 64"
          fill="none"
        >
          <path
            d="M32.4998 34.5883V21.686M32.4998 44.1516V44.265M48.6276 55.0106H16.372C11.9661 55.0106 8.24786 52.066 7.07802 48.0374C6.57865 46.3177 7.19224 44.5264 8.13077 43.0013L24.2586 13.5935C28.0372 7.45322 36.9625 7.45322 40.7411 13.5935L56.8688 43.0013C57.8074 44.5264 58.421 46.3177 57.9216 48.0374C56.7518 52.066 53.0336 55.0106 48.6276 55.0106Z"
            stroke="#FF2D46"
            stroke-width="6.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <h3 class="fw-bold">
          Seguro que quieres salir del proceso de reserva?
        </h3>
        <p>Aun no has solicitado tu cita</p>
        <div class="d-flex gap-2 justify-content-between">
          <div class="col">
            <button class="btn btn-outline-dark w-100 me-2" @click="closeModal">
              Continuar con reserva
            </button>
          </div>
          <div class="col">
            <button class="btn btn-danger w-100" @click="confirmExit">
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: Boolean,
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    confirmExit() {
      this.$emit("confirm-exit");
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  text-align: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-outline-dark {
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.btn-outline-dark:hover {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}
</style>
