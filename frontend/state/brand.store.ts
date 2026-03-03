import { create } from "zustand";
import axiosInstance from "@/services/axios";
import { isAxiosError } from "axios";
//
// Types (aligned with backend)
//

export type LogoPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"

export type PlatformType =
  | "instagram"
  | "twitter"
  | "linkedin"
  | "reddit"
  | "facebook";

export interface Brand {
  _id: string;
  name: string;
  description?: string;
  brandVoice?: string;
  logo?: string;
  brandColors?: string[];
  brandStyle?: string;
  brandText?: string;
  ctaStyle?: string;
  logoUrl?: string;
  logoPosition?: LogoPosition;
  connectedPlatforms?: PlatformType[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandConnection {
  platform: PlatformType;
  expires_at?: string;
  updatedAt: string;
}

//
// Store Interface
//

interface BrandState {
  brands: Brand[];
  activeBrand: Brand | null;
  connections: BrandConnection[];

  isLoadingBrands: boolean;
  isCreatingBrand: boolean;
  isUpdatingBrand: boolean;
  isLoadingConnections: boolean;

  fetchBrands: () => Promise<void>;
  createBrand: (data: Partial<Brand>) => Promise<Brand>;
  updateBrand: (brandId: string, data: Partial<Brand>) => Promise<void>;
  setActiveBrand: (brandId: string) => void;
  fetchConnections: (brandId: string) => Promise<void>;
  disconnectPlatform: (
    brandId: string,
    provider: PlatformType
  ) => Promise<void>;
  getOAuthUrl: (platform: PlatformType, userId: string, brandId: string) => Promise<string>;
}

//
// Store
//

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  activeBrand: null,
  connections: [],

  isLoadingBrands: false,
  isCreatingBrand: false,
  isUpdatingBrand: false,
  isLoadingConnections: false,

  //
  // GET ALL BRANDS
  //
  fetchBrands: async () => {
    try {
      set({ isLoadingBrands: true });

      const res = await axiosInstance.get("/brands");

      set({
        brands: res.data,
        isLoadingBrands: false,
      });

      // auto-select first brand if none active
      if (!get().activeBrand && res.data.length > 0) {
        set({ activeBrand: res.data[0] });
      }
    } catch (err) {
      set({ isLoadingBrands: false });
      throw err;
    }
  },

  //
  // CREATE BRAND
  //
  createBrand: async (data) => {
    try {
      set({ isCreatingBrand: true });
      const res = await axiosInstance.post("/brands", data);
      const newBrand = res.data;
      
      set((state) => ({
        brands: [newBrand, ...state.brands],
        activeBrand: newBrand,
        isCreatingBrand: false,
      }));

      return newBrand;
    } catch (err) { // <-- Removed :any
      set({ isCreatingBrand: false });
      const message = isAxiosError(err) ? err.response?.data?.message : "Failed to create brand";
      throw new Error(message);
    }
  },

  //
  // UPDATE BRAND
  //
  updateBrand: async (brandId, data) => {
    try {
      set({ isUpdatingBrand: true });
      const res = await axiosInstance.patch(`/brands/${brandId}`, data);
      const updated = res.data;

      set((state) => ({
        brands: state.brands.map((b) => (b._id === brandId ? updated : b)),
        activeBrand: state.activeBrand?._id === brandId ? updated : state.activeBrand,
        isUpdatingBrand: false,
      }));
    } catch (err) { // <-- Removed :any
      set({ isUpdatingBrand: false });
      const message = isAxiosError(err) ? err.response?.data?.message : "Failed to update brand";
      throw new Error(message);
    }
  },

  //
  // SET ACTIVE BRAND (local only)
  //
  setActiveBrand: (brandId) => {
    const brand = get().brands.find((b) => b._id === brandId);
    if (brand) {
      set({ activeBrand: brand });
    }
  },

  //
  // GET BRAND CONNECTIONS
  //
  fetchConnections: async (brandId) => {
    try {
      set({ isLoadingConnections: true });

      const res = await axiosInstance.get(
        `/brands/${brandId}/connections`
      );

      set({
        connections: res.data,
        isLoadingConnections: false,
      });
    } catch (err) {
      set({ isLoadingConnections: false });
      throw err;
    }
  },

  
  disconnectPlatform: async (brandId, provider) => {
    try {
      await axiosInstance.delete(`/brands/${brandId}/disconnect/${provider}`);

      set((state) => ({
        connections: state.connections.filter((c) => c.platform !== provider),
        brands: state.brands.map((brand) =>
          brand._id === brandId
            ? {
                ...brand,
                connectedPlatforms: brand.connectedPlatforms?.filter((p) => p !== provider) ?? [],
              }
            : brand
        ),
      }));
    } catch (err) { // <-- Removed :any
      const message = isAxiosError(err) ? err.response?.data?.message : "Failed to disconnect platform";
      throw new Error(message);
    }
  },

  getOAuthUrl: async (platform, userId, brandId) => {
    try {
      const res = await axiosInstance.get(`/auth/${platform}/url?userId=${userId}&brandId=${brandId}`);
      return res.data.url;
    } catch (err) { // <-- Removed :any
      const message = isAxiosError(err) ? err.response?.data?.message : `Failed to get ${platform} auth URL`;
      throw new Error(message);
    }
  }
}));