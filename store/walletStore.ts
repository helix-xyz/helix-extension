import { create } from "zustand";
import { IWallet, IWalletStoreState } from "./types";
import { createJSONStorage, persist } from "zustand/middleware";
import localforage from "localforage";

export const useWalletStore = create<IWalletStoreState>()(persist(
  (set) => ({
    wallets: [],
    activeWallet: 0,
    onCreateWallet: (wallet: IWallet) => {
      set(state => ({
        wallets: [...state.wallets, wallet],
        activeWallet: wallet.id
      }))
    },
    setActiveWallet: (id: number) => {
      set(state => ({
        activeWallet: id
      }))
    }
  }),
  {
    name: 'wallet-store',
    storage: createJSONStorage(() => localforage)
  }
))