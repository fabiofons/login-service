import { createAxiosClient } from "./createAxiosClient";
import useAuthStore from "@/app/store/authStore";

function getCurrentAccessToken() {
  const { accessToken } = useAuthStore.getState();
  return accessToken;
}

function getCurrentRefreshToken() {
  const { refreshToken } = useAuthStore.getState();
  return refreshToken;
}

function setRefreshedTokens(tokens: {
  accessToken: string;
  accessExpiresAt: string;
}) {
  useAuthStore.getState().setAccessToken(tokens.accessToken);
  useAuthStore.getState().setExpiredAt(new Date(tokens.accessExpiresAt));
}

async function logout() {
  await useAuthStore.getState().resetData();
}

export const client = createAxiosClient({
  options: {
    baseURL: "https://backend-staging.ppt.koombea.io/api",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  },
  getCurrentAccessToken,
  getCurrentRefreshToken,
  setRefreshedTokens,
  logout,
  refreshTokenUrl: "/team_members/session/refresh",
});
