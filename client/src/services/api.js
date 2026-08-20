import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach demo/auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("resqroute_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors so components always get a readable message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || "Unable to reach the server. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
