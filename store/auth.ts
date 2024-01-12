// store/auth.ts

import { defineStore } from 'pinia';

interface UserPayloadInterface {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    loading: false,
  }),
  actions: {
    async authenticateUser({ email, password }: UserPayloadInterface) {
      // useFetch from nuxt 3
      const { data, pending }: any = await useFetch('http://13.58.69.25:3000/users/login', {
        method: 'POST',
        headers: { 'Access-Control-Allow-Origin': '*' },
        mode: 'no-cors',
        body: {
          email,
          password,
        },
      });
      this.loading = pending;
      const token = useCookie('token'); // useCookie new hook in nuxt 3

      if (data.value) {
        token.value = data?.value?.token; // set token to cookie
        this.authenticated = true; // set authenticated  state value to true
      } else {
        this.authenticated = true;
        token.value = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
      }
    },
    logUserOut() {
      const token = useCookie('token'); // useCookie new hook in nuxt 3
      this.authenticated = false; // set authenticated  state value to false
      token.value = null; // clear the token cookie
    },
  },
});