"use client";

import { useQuery } from "@tanstack/react-query";

// Types matching the location service (wilayah.id)
export type Province = {
  code: string;
  name: string;
};

export type Regency = {
  code: string;
  name: string;
};

export type District = {
  code: string;
  name: string;
};

export type Village = {
  code: string;
  name: string;
};

// API response types
export type LocationResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/**
 * Location API object
 * Uses wilayah.id via our API routes
 */
export const locationApi = {
  getProvinces: async (): Promise<LocationResponse<Province[]>> => {
    const response = await fetch("/api/locations/provinces");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal memuat daftar provinsi");
    }
    return response.json();
  },

  getRegencies: async (
    provinceCode: string
  ): Promise<LocationResponse<Regency[]>> => {
    const response = await fetch(`/api/locations/regencies/${provinceCode}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal memuat daftar kota/kabupaten");
    }
    return response.json();
  },

  getDistricts: async (
    regencyCode: string
  ): Promise<LocationResponse<District[]>> => {
    const response = await fetch(
      `/api/locations/districts/${encodeURIComponent(regencyCode)}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal memuat daftar kecamatan");
    }
    return response.json();
  },

  getVillages: async (
    districtCode: string
  ): Promise<LocationResponse<Village[]>> => {
    const response = await fetch(
      `/api/locations/villages/${encodeURIComponent(districtCode)}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal memuat daftar kelurahan");
    }
    return response.json();
  },
};

/**
 * Hook to fetch all Indonesian provinces
 */
export function useProvinces() {
  return useQuery({
    queryKey: ["locations", "provinces"],
    queryFn: async () => {
      const response = await locationApi.getProvinces();
      return response.data;
    },
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch regencies (kota/kabupaten) within a province
 */
export function useRegencies(provinceCode: string | null) {
  return useQuery({
    queryKey: ["locations", "regencies", provinceCode],
    queryFn: async () => {
      if (!provinceCode) return [];
      const response = await locationApi.getRegencies(provinceCode);
      return response.data;
    },
    enabled: !!provinceCode,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch districts (kecamatan) within a regency
 */
export function useDistricts(regencyCode: string | null) {
  return useQuery({
    queryKey: ["locations", "districts", regencyCode],
    queryFn: async () => {
      if (!regencyCode) return [];
      const response = await locationApi.getDistricts(regencyCode);
      return response.data;
    },
    enabled: !!regencyCode,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch villages (kelurahan/desa) within a district
 */
export function useVillages(districtCode: string | null) {
  return useQuery({
    queryKey: ["locations", "villages", districtCode],
    queryFn: async () => {
      if (!districtCode) return [];
      const response = await locationApi.getVillages(districtCode);
      return response.data;
    },
    enabled: !!districtCode,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Legacy exports for backward compatibility (deprecated)
export { useRegencies as useCities };
