import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token?: string) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

// AUTH
export const authApi = {
  login: (email: string, password: string) => api.post("/user/login", { email, password }),
  register: (name: string, email: string, password: string, role: "cliente" | "vendedor") =>
    api.post("/user/register", { name, email, password, role }),
  logout: () => api.post("/user/logout"),
};

// PRODUCTS
export const productApi = {
  list: (params?: any) => api.get("/products", { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post("/products", data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
  uploadImages: (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    return api.post(`/products/${id}/images`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteImage: (id: string, publicId: string) =>
    api.delete(`/products/${id}/images`, { data: { publicId } }),

  listByVendor: (vendorId: string) =>
    api.get(`/products/vendor/${vendorId}`),
};

// CART
export const cartApi = {
  get: () => api.get("/cart"),
  add: (productId: string, qty = 1) => api.post("/cart", { productId, qty }),
  update: (items: any[]) => api.put("/cart", { items }),
  remove: (productId: string) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete("/cart"),
};

// ORDERS
export const orderApi = {
  checkout: () => api.post("/orders/checkout"),
  list: () => api.get("/orders"),
  get: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
};

// PAYMENTS
export const paymentApi = {
  createPix: (orderId: string) => api.post("/payments/create-pix", { orderId }),
  webhook: (payload: any) => api.post("/payments/webhook", payload),
  status: (orderId: string) => api.get(`/payments/${orderId}/status`),
};

// VENDOR
export const vendorApi = {
  dashboard: () => api.get("/vendor/dashboard"),
};
