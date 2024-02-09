// stores/index.ts

export const useStore = defineStore('store', {
    state: () => ({
      authenticated: false,
      user: [],
    }),
    getters: {},
    actions: {}
  })
