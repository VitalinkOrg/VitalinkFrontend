import { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "admin-dashboard" | "aseguradora-dashboard" | "aseguradora-login" | "clinicas-dashboard" | "medicos-dashboard" | "pacientes-dashboard" | "pacientes-login" | "web"
declare module "../../node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}