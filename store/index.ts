// stores/index.ts

export const useStore = defineStore('store', {
    state: () => ({
      authenticated: false,
      role: '',
      user: [],
    }),
    getters: {},
    actions: {}
  })
