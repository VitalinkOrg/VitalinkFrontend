// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: '/bootstrap.bundle.min.js',
          tagPosition: 'bodyClose'
        }
      ]
    }
  },

  css: ['@/assets/main.scss'],
  devtools: { enabled: true },

  modules: [
    'nuxt-icon',
    '@samk-dev/nuxt-vcalendar'
  ],

  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.API_BASE_URL,

    },
  },
})