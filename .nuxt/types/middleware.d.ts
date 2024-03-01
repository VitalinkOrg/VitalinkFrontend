import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "auth-doctors-hospitals" | "auth-hospitals" | "auth-insurances" | "auth-pacientes"
declare module "../../node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}