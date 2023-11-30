import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { BusinessData, TaxPayer } from "libs/types";

interface State {
  clientData: Partial<TaxPayer>;
  businessesData: BusinessData[] | [];
  teamMemberClient: any;
}

interface Actions {
  setClient: (data: any) => void;
  resetData: () => void;
  setBusinesses: (data: BusinessData[]) => void;
  setTeamMemberClient: (data: any) => void;
}

const initialState = {
  clientData: {},
  businessesData: [],
  teamMemberClient: {},
};

const useClientStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setClient: (newData: any) => set(() => ({ clientData: newData })),
        resetData: () => set(() => initialState),
        setBusinesses: (newData: BusinessData[]) =>
          set(() => ({ businessesData: newData })),
        setTeamMemberClient: (newClient: any) =>
          set(() => ({ teamMemberClient: newClient })),
      }),
      { name: "clientStore" }
    )
  )
);

export default useClientStore;
