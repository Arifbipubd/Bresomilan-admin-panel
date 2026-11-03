"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SIDEBAR_EXPANDED = 260;
export const SIDEBAR_COLLAPSED = 80;
export const SIDEBAR_AUTO_COLLAPSE_BP = 1024;

interface SidebarState {
  collapsed: boolean;
  manualOverride: boolean;
  hydrated: boolean;
  setCollapsed: (collapsed: boolean, manual?: boolean) => void;
  toggle: () => void;
  syncToViewport: (width: number) => void;
  setHydrated: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      manualOverride: false,
      hydrated: false,

      setCollapsed: (collapsed, manual = false) =>
        set({
          collapsed,
          manualOverride: manual ? true : get().manualOverride,
        }),

      toggle: () => {
        const next = !get().collapsed;
        set({ collapsed: next, manualOverride: true });
      },

      syncToViewport: (width) => {
        const { manualOverride } = get();
        if (width < SIDEBAR_AUTO_COLLAPSE_BP) {
          // Always auto-minimize under the breakpoint.
          set({ collapsed: true, manualOverride: false });
          return;
        }
        // Crossing back to desktop clears auto mode unless user pinned collapsed.
        if (!manualOverride) {
          set({ collapsed: false });
        }
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "bresomilan-admin-sidebar",
      partialize: (s) => ({ collapsed: s.collapsed, manualOverride: s.manualOverride }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (typeof window !== "undefined") {
          state?.syncToViewport(window.innerWidth);
        }
      },
    }
  )
);
