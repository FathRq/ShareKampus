import axios from "axios";

export const TOKEN_KEY = "sharekampus_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiError(err) {
  const data = err?.response?.data;
  if (data && data.success === false && data.error) {
    return { code: data.error.code || "UNKNOWN", message: data.error.message || "Terjadi kesalahan" };
  }
  if (err?.code === "ECONNABORTED") {
    return { code: "TIMEOUT", message: "Koneksi ke server timeout, coba lagi" };
  }
  if (!err?.response) {
    return { code: "NETWORK_ERROR", message: "Tidak bisa terhubung ke server. Pastikan backend berjalan." };
  }
  return { code: "UNKNOWN", message: "Terjadi kesalahan, coba lagi" };
}

/** Backend returns { success, data } — unwrap data, throw normalized error otherwise. */
export async function unwrap(promise) {
  try {
    const res = await promise;
    return res.data?.data;
  } catch (err) {
    throw getApiError(err);
  }
}

export const authApi = {
  register: (payload) => unwrap(api.post("/auth/register", payload)),
  login: (payload) => unwrap(api.post("/auth/login", payload)),
};

export const campusApi = {
  listLocations: async () => {
    const data = await unwrap(api.get("/campus-locations"));
    // Actual shape: { locations: [...] }
    return data?.locations ?? data ?? [];
  },
};

export const itemApi = {
  nearby: (params) => unwrap(api.get("/items/nearby", { params })),
  create: (payload) => unwrap(api.post("/items", payload)),
  remove: (id) => unwrap(api.delete(`/items/${id}`)),
};

export const transactionApi = {
  list: async () => {
    const data = await unwrap(api.get("/transactions"));
    return Array.isArray(data) ? data : [];
  },
  detail: (id) => unwrap(api.get(`/transactions/${id}`)),
  create: (payload) => unwrap(api.post("/transactions", payload)),
  updateStatus: (id, payload) => unwrap(api.patch(`/transactions/${id}/status`, payload)),
};

export const reviewApi = {
  create: (payload) => unwrap(api.post("/reviews", payload)),
};

export const userApi = {
  me: () => unwrap(api.get("/users/me")),
  trustScore: (id) => unwrap(api.get(`/users/${id}/trust-score`)),
};

export const statsApi = {
  expenseSaver: () => unwrap(api.get("/stats/expense-saver")),
};

export default api;
