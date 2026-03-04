import axiosInstance from "@/services/axios";
import { create } from "zustand";



interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;

  signup: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;

  login: (data: {
    email: string;
    password: string;
  }) => Promise<void>;

  logout: () => Promise<void>;

  checkAuth: () => Promise<void>;
}



export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  //
  // SIGNUP
  //
  signup: async (data) => {
    try {
      set({ isSigningUp: true });

      const res = await axiosInstance.post("/auth/signup", data);

      set({
        user: res.data,
        isSigningUp: false,
      });
    } catch (error: any) {
      set({ isSigningUp: false });

      const message =
        error.response?.data?.message || "Signup failed";
      throw new Error(message);
    }
  },

  //
  // LOGIN
  //
  login: async (data) => {
    try {
      set({ isLoggingIn: true });

      const res = await axiosInstance.post("/auth/login", data);

      set({
        user: res.data,
        isLoggingIn: false,
      });
    } catch (error: any) {
      set({ isLoggingIn: false });

      const message =
        error.response?.data?.message || "Login failed";
      throw new Error(message);
    }
  },



  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      set({ user: null });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Logout failed";
      throw new Error(message);
    }
  },

  
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({
        user: res.data,
        isCheckingAuth: false,
      });
    } catch {
      set({
        user: null,
        isCheckingAuth: false,
      });
    }
  },
}));