<script lang="ts" setup>
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ref } from "vue";

import type { Customer } from "~/types";

interface RuntimeConfig {
  public: {
    API_BASE_URL: string;
  };
}

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const config: RuntimeConfig = useRuntimeConfig();
const token = useCookie<string>("token");
const role = useCookie<string>("role");
const tab = ref<number>(1);
const allAppointments = ref();

let url: string;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/get_patients";
} else {
  url = "/doctor_dashboard/get_patients";
}

// const { data: patients, loading } = await useFetch(
//   config.public.API_BASE_URL + url,
//   {
//     headers: { Authorization: token.value },
//     transform: (_patients) => _patients.data,
//   },
// );

const patients: Customer[] = [
  {
    id: "1",
    card_id: "ABC123",
    name: "Juan Pérez",
    email: "juan.perez@gmail.com",
    user_name: "jperez",
    phone_number: "4444565756",
    gender: "M",
    birth_date: "1990-01-01",
    country_iso_code: "CR",
    province: "San José",
    address: "Calle Falsa 123",
    city_name: "San José",
    postal_code: "10101",
    role_code: "CUSTOMER",
    is_deleted: 0,
    is_active_from_email: 1,
    account_status: "ACTIVE",
    fail_login_number: 0,
    forgot_password_token: null,
    active_register_token: null,
    latitude: null,
    longitude: null,
    code_contract: null,
    language: "es",
    profile_picture_url: null,
    last_login_at: "2023-10-01T10:00:00Z",
    login_ip_address: "192.168.1.1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-10-01T10:00:00Z",
    verified_at: "2023-01-01T12:00:00Z",
    id_type: {
      id: 1,
      code: "CEDULA",
      name: "Cédula Nacional",
      type: "IDENTIFICATION",
      description: "Documento de identificación nacional",
      father_code: null,
      value1: null,
      created_date: "2023-01-01T00:00:00Z",
      updated_date: null,
      is_deleted: 0,
    },
  },
  {
    id: "2",
    card_id: "DEF456",
    name: "María López",
    email: "maria.lopez@gmail.com",
    user_name: "mlopez",
    phone_number: "4444565757",
    gender: "F",
    birth_date: "1985-05-15",
    country_iso_code: "CR",
    province: "Cartago",
    address: "Avenida Siempre Viva 742",
    city_name: "Cartago",
    postal_code: "30101",
    role_code: "CUSTOMER",
    is_deleted: 0,
    is_active_from_email: 1,
    account_status: "ACTIVE",
    fail_login_number: 0,
    forgot_password_token: null,
    active_register_token: null,
    latitude: null,
    longitude: null,
    code_contract: null,
    language: "es",
    profile_picture_url: null,
    last_login_at: "2023-10-02T12:00:00Z",
    login_ip_address: "192.168.1.2",
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-10-02T12:00:00Z",
    verified_at: "2023-02-01T15:00:00Z",
    id_type: {
      id: 1,
      code: "CEDULA",
      name: "Cédula Nacional",
      type: "IDENTIFICATION",
      description: "Documento de identificación nacional",
      father_code: null,
      value1: null,
      created_date: "2023-01-01T00:00:00Z",
      updated_date: null,
      is_deleted: 0,
    },
  },
  {
    id: "3",
    card_id: "GHI789",
    name: "Carlos García",
    email: "carlos.garcia@gmail.com",
    user_name: "cgarcia",
    phone_number: "4444565758",
    gender: "M",
    birth_date: "1978-12-20",
    country_iso_code: "CR",
    province: "Heredia",
    address: "Calle Luna 456",
    city_name: "Heredia",
    postal_code: "40101",
    role_code: "CUSTOMER",
    is_deleted: 0,
    is_active_from_email: 1,
    account_status: "ACTIVE",
    fail_login_number: 0,
    forgot_password_token: null,
    active_register_token: null,
    latitude: null,
    longitude: null,
    code_contract: null,
    language: "es",
    profile_picture_url: null,
    last_login_at: "2023-10-03T14:00:00Z",
    login_ip_address: "192.168.1.3",
    created_at: "2023-03-01T00:00:00Z",
    updated_at: "2023-10-03T14:00:00Z",
    verified_at: "2023-03-01T16:00:00Z",
    id_type: {
      id: 1,
      code: "CEDULA",
      name: "Cédula Nacional",
      type: "IDENTIFICATION",
      description: "Documento de identificación nacional",
      father_code: null,
      value1: null,
      created_date: "2023-01-01T00:00:00Z",
      updated_date: null,
      is_deleted: 0,
    },
  },
];

const downloadAllPatients = (): void => {
  if (!patients || patients.length === 0) return;

  const doc = new jsPDF();
  const pageWidth: number = doc.internal.pageSize.getWidth();
  const margin: number = 15;
  let yPosition: number = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Pacientes", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const headers: string[] = ["Paciente", "Direccion", "Telefono", "Correo"];
  const columnWidths: number[] = [40, 50, 40, 40];
  let xPosition: number = margin;

  headers.forEach((header: string, i: number) => {
    doc.text(header, xPosition, yPosition);
    xPosition += columnWidths[i];
  });
  yPosition += 8;

  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  patients.forEach((customer: Customer, index: number) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const row: string[] = [
      customer.name,
      customer.address,
      customer.phone_number,
      customer.email,
    ];

    xPosition = margin;
    row.forEach((cell: string, i: number) => {
      doc.text(cell, xPosition, yPosition);
      xPosition += columnWidths[i];
    });

    yPosition += 8;

    if (index < patients.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      doc.setDrawColor(0, 0, 0);
      yPosition += 4;
    }
  });

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total pacientes: ${patients.length}`, margin, 280);
  doc.text("Sistema de Gestión Médica - Vitalink", pageWidth / 2, 280, {
    align: "center",
  });

  doc.save(`Reporte_Pacientes_${new Date().toISOString().slice(0, 10)}.pdf`);
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <UiHeaderBreadcrumb title="Mis Pacientes" />

    <div class="patients__actions--wrapper">
      <UiSearchInput
        placeholder="Buscar"
        aria-label="Buscar en mis citas"
        max-width="320px"
      />
      <div class="patients__actions">
        <button disabled class="patients__button--outline">
          + Nuevo Paciente
        </button>
        <button class="patients__button--outline" @click="downloadAllPatients">
          <AtomsIconsDownloadIcon /> Descargar
        </button>
        <div class="dropdown">
          <button
            class="patients__button--outline dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Ordenar por
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <MedicosPacientesTabla :patients="patients" />
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.patients {
  &__actions {
    display: flex;
    gap: 0.75rem;

    &--wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
    }
  }

  &__input {
    @include input-base;
  }

  &__button {
    &--outline {
      @include outline-button;
    }

    &--primary {
      @include primary-button;
    }
  }
}
</style>
