const STORAGE_KEY = "whygram_app_config";

export const DEFAULT_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000",
  appName: "WHYGRAM",
  postsPerPage: 20,
  enableStories: true,
  enableReels: true,
  enableChat: true,
  compressImages: true,
  darkOnly: true,
  language: "ru",
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(next) {
  const merged = { ...DEFAULT_CONFIG, ...loadConfig(), ...next };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(
    new CustomEvent("whygram-config-changed", { detail: merged })
  );
  return merged;
}

export function resetConfig() {
  localStorage.removeItem(STORAGE_KEY);
  const fresh = { ...DEFAULT_CONFIG };
  window.dispatchEvent(
    new CustomEvent("whygram-config-changed", { detail: fresh })
  );
  return fresh;
}

export function getApiBaseUrl() {
  return loadConfig().apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl;
}
