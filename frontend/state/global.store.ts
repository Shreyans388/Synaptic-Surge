import { create } from "zustand";

type SystemStatus = "idle" | "generating" | "monitoring";

interface ActiveBrand {
  _id: string;
  name: string;
}

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

interface GlobalState {
  activeBrand: ActiveBrand | null;
  theme: "light" | "dark";
  systemStatus: SystemStatus;
  notifications: Notification[];
 
  setTheme: (theme: "light" | "dark") => void;
  setActiveBrand: (brand: ActiveBrand | null) => void;
  setSystemStatus: (status: SystemStatus) => void;

  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  resetAppState: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  activeBrand: null,
  theme: "light",
  systemStatus: "idle",
  notifications: [],
  
  setTheme: (theme) => set({ theme }),

  setActiveBrand: (brand) => set({ activeBrand: brand }),

  setSystemStatus: (status) => set({ systemStatus: status }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.id !== id
      ),
    })),

  resetAppState: () =>
    set({
      activeBrand: null,
      systemStatus: "idle",
      notifications: [],
    }),
    
}));