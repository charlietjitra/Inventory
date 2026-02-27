import axios, { AxiosInstance } from "axios";
import apiCache from "./cache";

// Auto-detect API URL based on environment
const getAPIUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use the same host as frontend but port 3000 for backend
    const host = window.location.hostname;
    return `http://${host}:3000/api`;
  }
  // Server-side: use environment variable
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
};

const API_URL = getAPIUrl();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're NOT already on the login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Helper function to cache GET requests
const cachedGet = (key: string, url: string, ttl?: number) => {
  return async () => {
    const cached = apiCache.get(key);
    if (cached) return Promise.resolve({ data: cached });

    const response = await api.get(url);
    apiCache.set(key, response.data, ttl);
    return response;
  };
};

// Auth API
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  getCurrentUser: () => api.get("/auth/me"),
  verifyToken: () => api.get("/auth/verify"),
};

// Species API
export const speciesAPI = {
  getAll: () => cachedGet("species/all", "/species", 10 * 60 * 1000)(),
  getById: (id: number) =>
    cachedGet(`species/${id}`, `/species/${id}`, 10 * 60 * 1000)(),
  create: async (data: any) => {
    const response = await api.post("/species", data);
    apiCache.invalidate("species.*");
    return response;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/species/${id}`, data);
    apiCache.invalidate("species.*");
    return response;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/species/${id}`);
    apiCache.invalidate("species.*");
    return response;
  },
};

// Subspecies API
export const subspeciesAPI = {
  getAll: () => cachedGet("subspecies/all", "/subspecies", 10 * 60 * 1000)(),
  getById: (id: number) =>
    cachedGet(`subspecies/${id}`, `/subspecies/${id}`, 10 * 60 * 1000)(),
  create: async (data: any) => {
    const response = await api.post("/subspecies", data);
    apiCache.invalidate("subspecies.*");
    return response;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/subspecies/${id}`, data);
    apiCache.invalidate("subspecies.*");
    return response;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/subspecies/${id}`);
    apiCache.invalidate("subspecies.*");
    return response;
  },
};

// Size Categories API
export const sizeCategoriesAPI = {
  getAll: () =>
    cachedGet("size-categories/all", "/size-categories", 10 * 60 * 1000)(),
  getById: (id: number) =>
    cachedGet(
      `size-categories/${id}`,
      `/size-categories/${id}`,
      10 * 60 * 1000,
    )(),
  create: async (data: any) => {
    const response = await api.post("/size-categories", data);
    apiCache.invalidate("size-categories.*");
    return response;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/size-categories/${id}`, data);
    apiCache.invalidate("size-categories.*");
    return response;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/size-categories/${id}`);
    apiCache.invalidate("size-categories.*");
    return response;
  },
};

// Items API
export const itemsAPI = {
  getAll: () => cachedGet("items/all", "/items", 5 * 60 * 1000)(),
  getById: (id: number) =>
    cachedGet(`items/${id}`, `/items/${id}`, 5 * 60 * 1000)(),
  create: async (data: any) => {
    const response = await api.post("/items", data);
    apiCache.invalidate("items.*");
    apiCache.invalidate("owners.*");
    return response;
  },
};

// Owners API
export const ownersAPI = {
  getAll: () => cachedGet("owners/all", "/owners", 5 * 60 * 1000)(),
  getById: (id: number) =>
    cachedGet(`owners/${id}`, `/owners/${id}`, 5 * 60 * 1000)(),
  create: async (data: any) => {
    const response = await api.post("/owners", data);
    apiCache.invalidate("owners.*");
    apiCache.invalidate("pallets.*");
    return response;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/owners/${id}`, data);
    apiCache.invalidate("owners.*");
    return response;
  },
  addItem: async (data: any) => {
    const response = await api.post("/owners/items/add", data);
    apiCache.invalidate("owners.*");
    return response;
  },
  removeItem: async (data: any) => {
    const response = await api.delete("/owners/items/remove", { data });
    apiCache.invalidate("owners.*");
    return response;
  },
};

// Pallets API
export const palletsAPI = {
  getAll: () => cachedGet("pallets/all", "/pallets", 3 * 60 * 1000)(),
  getById: (id: string) =>
    cachedGet(`pallets/${id}`, `/pallets/${id}`, 3 * 60 * 1000)(),
  create: async (data: any) => {
    const response = await api.post("/pallets", data);
    apiCache.invalidate("pallets.*");
    return response;
  },
  getPalletStatus: (id: string) =>
    cachedGet(`pallets/status/${id}`, `/pallets/${id}`, 2 * 60 * 1000)(),
  getPalletHistory: (id: string) =>
    cachedGet(
      `pallets/history/${id}`,
      `/pallets/${id}/history`,
      3 * 60 * 1000,
    )(),
  // Optimized endpoint that returns everything for detail page in one call
  getPalletDetail: (id: string) =>
    cachedGet(`pallets/detail/${id}`, `/pallets/${id}/detail`, 2 * 60 * 1000)(),
  assignLocation: async (id: string, data: any) => {
    const response = await api.post(`/pallets/${id}/assign-location`, data);
    apiCache.invalidate("pallets.*");
    return response;
  },
  addContents: async (id: string, data: any) => {
    const response = await api.post(`/pallets/${id}/add-contents`, data);
    apiCache.invalidate("pallets.*");
    return response;
  },
  removeContents: async (id: string, data: any) => {
    const response = await api.post(`/pallets/${id}/remove-contents`, data);
    apiCache.invalidate("pallets.*");
    return response;
  },
  movePallet: async (id: string, data: any) => {
    const response = await api.post(`/pallets/${id}/move`, data);
    apiCache.invalidate("pallets.*");
    return response;
  },
  getStorageDuration: () =>
    cachedGet(
      "pallets/storage/duration",
      "/pallets/storage/duration",
      10 * 60 * 1000,
    )(),
};

// Lots API
export const lotsAPI = {
  getAll: () => cachedGet("lots/all", "/lots", 5 * 60 * 1000)(),
  getById: (id: string) =>
    cachedGet(`lots/${id}`, `/lots/${id}`, 5 * 60 * 1000)(),
  getHistory: (id: string) =>
    cachedGet(`lots/history/${id}`, `/lots/${id}/history`, 5 * 60 * 1000)(),
};

export default api;
