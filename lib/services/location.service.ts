/**
 * Location Service
 * Handles wilayah.id API integration for Indonesian location data
 * No authorization required - public API
 */

import { ValidationError } from "@/lib/errors";

// Types
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

// wilayah.id API response types
type WilayahProvinceResponse = {
  data: Array<{ code: string; name: string }>;
  meta: { administrative_area_level: number; updated_at: string };
};

type WilayahRegencyResponse = {
  data: Array<{ code: string; name: string }>;
  meta: { administrative_area_level: number; updated_at: string };
};

type WilayahDistrictResponse = {
  data: Array<{ code: string; name: string }>;
  meta: { administrative_area_level: number; updated_at: string };
};

type WilayahVillageResponse = {
  data: Array<{ code: string; name: string }>;
  meta: { administrative_area_level: number; updated_at: string };
};

// In-memory cache with TTL
type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const locationCache = new Map<string, CacheEntry<unknown>>();

// Cache TTL: 7 days (location data rarely changes)
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const cached = locationCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  if (cached) {
    locationCache.delete(key);
  }
  return null;
}

function setCache<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  locationCache.set(key, { data, expiry: Date.now() + ttlMs });
}

const BASE_URL = "https://wilayah.id/api";

/**
 * Fetch from wilayah.id API
 */
async function wilayahFetch<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 }, // Cache for 24 hours in Next.js
  });

  if (!response.ok) {
    throw new Error(`wilayah.id API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Location Service
 */
export const locationService = {
  /**
   * Get all Indonesian provinces
   */
  async getProvinces(): Promise<Province[]> {
    const cacheKey = "provinces";
    const cached = getCached<Province[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response =
      await wilayahFetch<WilayahProvinceResponse>("/provinces.json");

    const provinces: Province[] = response.data.map((p) => ({
      code: p.code,
      name: p.name,
    }));

    setCache(cacheKey, provinces);
    return provinces;
  },

  /**
   * Get regencies (kota/kabupaten) within a province
   */
  async getRegencies(provinceCode: string): Promise<Regency[]> {
    if (!provinceCode) {
      throw new ValidationError("Kode provinsi diperlukan");
    }

    const cacheKey = `regencies:${provinceCode}`;
    const cached = getCached<Regency[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await wilayahFetch<WilayahRegencyResponse>(
      `/regencies/${provinceCode}.json`
    );

    const regencies: Regency[] = response.data.map((r) => ({
      code: r.code,
      name: r.name,
    }));

    setCache(cacheKey, regencies);
    return regencies;
  },

  /**
   * Get districts (kecamatan) within a regency
   */
  async getDistricts(regencyCode: string): Promise<District[]> {
    if (!regencyCode) {
      throw new ValidationError("Kode kota/kabupaten diperlukan");
    }

    const cacheKey = `districts:${regencyCode}`;
    const cached = getCached<District[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await wilayahFetch<WilayahDistrictResponse>(
      `/districts/${regencyCode}.json`
    );

    const districts: District[] = response.data.map((d) => ({
      code: d.code,
      name: d.name,
    }));

    setCache(cacheKey, districts);
    return districts;
  },

  /**
   * Get villages (kelurahan/desa) within a district
   */
  async getVillages(districtCode: string): Promise<Village[]> {
    if (!districtCode) {
      throw new ValidationError("Kode kecamatan diperlukan");
    }

    const cacheKey = `villages:${districtCode}`;
    const cached = getCached<Village[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await wilayahFetch<WilayahVillageResponse>(
      `/villages/${districtCode}.json`
    );

    const villages: Village[] = response.data.map((v) => ({
      code: v.code,
      name: v.name,
    }));

    setCache(cacheKey, villages);
    return villages;
  },

  /**
   * Clear location cache
   */
  clearCache(): void {
    locationCache.clear();
  },
};
