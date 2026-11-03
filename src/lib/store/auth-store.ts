"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { fetchMe, loginStaff, logoutStaff, updateMyProfile } from "@/lib/api/admin";
import { setOnSessionExpired } from "@/lib/api/token-store";
import type { StaffUser } from "@/lib/types";

interface AuthState {
  user: StaffUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  setUser: (user: StaffUser) => void;
  updateProfile: (data: { name?: string; phone?: string } | FormData) => Promise<StaffUser>;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,

      login: async (email, password) => {
        const user = await loginStaff(email, password);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        logoutStaff();
        set({ user: null, isAuthenticated: false });
      },

      refreshMe: async () => {
        const user = await fetchMe();
        set({ user, isAuthenticated: true });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      updateProfile: async (data) => {
        const user = await updateMyProfile(data);
        set({ user });
        return user;
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "bresomilan-admin-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

setOnSessionExpired(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});
