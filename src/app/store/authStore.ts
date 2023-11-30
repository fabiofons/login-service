import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  accessToken: string | null;
  refreshToken: string | null;
  expiredAt: Date | null;
}

interface Actions {
  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setExpiredAt: (expiredAt: Date) => void;
  resetData: () => void;
}

const initialState = {
  accessToken: null,
  refreshToken: null,
  expiredAt: null,
};

const useAuthStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      setAccessToken: (accessToken: string) => set(() => ({ accessToken })),
      setRefreshToken: (refreshToken: string) => set(() => ({ refreshToken })),
      setExpiredAt: (expiredAt: Date) => set(() => ({ expiredAt })),
      resetData: () => set(() => initialState),
    }),
    { name: "authStore" }
  )
);

export default useAuthStore;
