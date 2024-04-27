import { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "admin-dashboard" | "aseguradoras-dashboard" | "aseguradoras-login" | "clinicas-dashboard" | "medicos-dashboard-perfil" | "medicos-dashboard" | "pacientes-dashboard-perfil" | "pacientes-dashboard" | "pacientes-login" | "web"
declare module "../../node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}