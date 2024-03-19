// stores/index.ts

export const useStore = defineStore('store', {
    state: () => ({
      authenticated: false,
      role: '',
      user: null,
    }),
    getters: {},
    actions: {}
  })
