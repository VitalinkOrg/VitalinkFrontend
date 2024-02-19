// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'nuxt-icon'
  ],
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.API_BASE_URL,

    },
  },
})
