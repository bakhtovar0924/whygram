import axios from "axios";
import { getApiBaseUrl, loadConfig } from "../config/appConfig";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

if (typeof window !== "undefined") {
  window.addEventListener("whygram-config-changed", () => {
    api.defaults.baseURL = getApiBaseUrl();
  });
}

export function applyRuntimeConfig() {
  const cfg = loadConfig();
  api.defaults.baseURL = cfg.apiBaseUrl;
  return cfg;
}

export default api;
