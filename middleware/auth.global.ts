// middleware/auth.ts
import { useStore } from "~/store";
import { useRefreshToken } from "#imports";

export default defineNuxtRouteMiddleware((to) => {
  const store = useStore();
  const token = useCookie("token");
  const role = useCookie("role");
  const config = useRuntimeConfig();
  console.log(store.user, "test");

  if (token.value) {
    store.authenticated = true;
    if (store.user == null) {
      if (role.value === "R_PAT") {
        const { data: user }: any = useFetch(
          config.public.API_BASE_URL + "/patients/getByUser",
          {
            headers: { Authorization: token.value },
            transform: (_user: any) => _user.data,
          }
        );
        if (user) {
          store.user = user;
          useRefreshToken();
        }
      }
    }
  }
});
