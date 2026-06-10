import { create } from "zustand";
import type { UserRole } from "@/lib/types";

interface AppState {
  selectedOutletId: string | null;
  role: UserRole;
  sidebarCollapsed: boolean;
  setSelectedOutlet: (outletId: string | null) => void;
  setRole: (role: UserRole) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedOutletId: null,
  role: "owner",
  sidebarCollapsed: false,
  setSelectedOutlet: (outletId) => set({ selectedOutletId: outletId }),
  setRole: (role) => set({ role }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
