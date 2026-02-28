import { create } from "zustand";

type SystemStatus = "idle" | "generating" | "monitoring";

interface GlobalState {
  user: {
    id: string;
    name: string;
    email?: string;
  } | null;

  activeBrand: {
    id: string;
    name: string;
  } | null;

  theme: "light" | "dark";

  systemStatus: SystemStatus;

  notifications: {
    id: string;
    message: string;
    type: "info" | "success" | "error";
  }[];

  setTheme: (theme: "light" | "dark") => void;
  setActiveBrand: (brand: { id: string; name: string }) => void;
  setSystemStatus: (status: SystemStatus) => void;
  addNotification: (notification: {
    id: string;
    message: string;
    type: "info" | "success" | "error";
  }) => void;
  removeNotification: (id: string) => void;
  token: string | null;

  setAuth: (
    user: {
      id: string;
      name: string;
      email?: string;
    },
    token?: string | null
  ) => void;
  logout: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  user: null,
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
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  token: null,

  setAuth: (user, token = null) =>
    set({
      user,
      token,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      activeBrand: null,
    }),
}));